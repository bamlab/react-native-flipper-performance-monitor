interface HistogramValue {
  renderingTime: number;
  frameCount: number;
}

interface RenderingTimeMeasures {
  totalFramesRendered: number;
  totalRenderTime: number;
}

interface Measure {
  jankyFrames: {
    totalRendered: number;
    count: number;
  };
  renderingTime: RenderingTimeMeasures;
}

interface MarkerMeasure {
  markerName: string;
  measure: Measure;
}

const roundToDecimal = (value: number, decimalCount: number) => {
  const factor = Math.pow(10, decimalCount);
  return Math.floor(value * factor) / factor;
};

export class GfxInfo {
  androidPackage: string;
  measures: MarkerMeasure[];

  constructor({androidPackage}: {androidPackage: string}) {
    this.androidPackage = androidPackage;
    this.measures = [];
  }

  private async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) =>
      require('child_process').exec(command, function (err, stdout, stderr) {
        if (err) return reject(err);
        return resolve(stdout);
      }),
    );
  }

  private async resetDumpSys(): Promise<void> {
    await this.executeCommand(
      `adb shell dumpsys gfxinfo ${this.androidPackage} reset`,
    );
  }

  private async getGfxInfo(): Promise<string> {
    return this.executeCommand(
      `adb shell dumpsys gfxinfo ${this.androidPackage}`,
    );
  }

  private parseHistogram(histogramText: string): HistogramValue[] {
    return histogramText.split(' ').map((renderTimeText) => {
      const [renderingTime, frameCount] = renderTimeText
        .split('ms=')
        .map((text) => parseInt(text, 10));
      return {renderingTime, frameCount};
    });
  }

  private getRenderingTimeMeasures(
    histogram: HistogramValue[],
  ): RenderingTimeMeasures {
    const {totalFramesRendered, totalRenderTime} = histogram.reduce(
      (aggregator, {renderingTime, frameCount}) => ({
        totalFramesRendered: aggregator.totalFramesRendered + frameCount,
        totalRenderTime:
          aggregator.totalRenderTime + frameCount * renderingTime,
      }),
      {totalFramesRendered: 0, totalRenderTime: 0},
    );

    return {
      totalFramesRendered,
      totalRenderTime,
    };
  }

  private async measure(): Promise<Measure> {
    const gfxOutput: {[name: string]: string} = (await this.getGfxInfo())
      .split('\n')
      .reduce((values, line) => {
        const [name, value] = line.split(': ');
        return value !== undefined ? {...values, [name]: value} : values;
      }, {});

    const jankyFrames = {
      totalRendered: parseInt(gfxOutput['Total frames rendered'], 10),
      count: parseInt(gfxOutput['Janky frames'], 10),
    };

    const renderingTime = this.getRenderingTimeMeasures(
      this.parseHistogram(gfxOutput['HISTOGRAM']),
    );

    return {
      jankyFrames,
      renderingTime,
    };
  }

  public async addMeasureMarker(markerName: string) {
    const measure = await this.measure();
    this.measures.push({
      markerName,
      measure,
    });
    await this.resetDumpSys();
  }

  private reportMeasure({
    markerName,
    measure: {
      jankyFrames,
      renderingTime: {totalFramesRendered, totalRenderTime},
    },
  }: MarkerMeasure) {
    console.log(`${markerName}:
Janky frames: ${jankyFrames.count}/${
      jankyFrames.totalRendered
    } (${roundToDecimal(
      (jankyFrames.count / jankyFrames.totalRendered) * 100,
      2,
    )}%)
Average rendering time: ${roundToDecimal(
      totalRenderTime / totalFramesRendered,
      2,
    )}ms`);
  }

  private aggregateMeasures(): Measure {
    return this.measures.reduce(
      (aggregator, {measure}) => ({
        jankyFrames: {
          totalRendered:
            aggregator.jankyFrames.totalRendered +
            measure.jankyFrames.totalRendered,
          count: aggregator.jankyFrames.count + measure.jankyFrames.count,
        },
        renderingTime: {
          totalFramesRendered:
            aggregator.renderingTime.totalFramesRendered +
            measure.renderingTime.totalFramesRendered,
          totalRenderTime:
            aggregator.renderingTime.totalRenderTime +
            measure.renderingTime.totalRenderTime,
        },
      }),
      {
        jankyFrames: {
          totalRendered: 0,
          count: 0,
        },
        renderingTime: {
          totalFramesRendered: 0,
          totalRenderTime: 0,
        },
      },
    );
  }

  public report() {
    console.log(this.measures);
    this.measures.forEach(this.reportMeasure);
    this.reportMeasure({
      markerName: 'Total',
      measure: this.aggregateMeasures(),
    });
  }
}
