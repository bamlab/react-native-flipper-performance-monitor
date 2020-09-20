import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const getColor = (score) => {
  if (score >= 90) return '#2ECC40';
  if (score >= 50) return '#FF851B';
  return '#FF4136';
};

export const CircularProgressWithLabel = (props) => {
  const color = getColor(props.value);

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} style={{color}} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center">
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
          style={{fontSize: 28, color}}>{`${Math.round(
          props.value,
        )}`}</Typography>
      </Box>
    </Box>
  );
};
