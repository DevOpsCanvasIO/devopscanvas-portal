import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  svg: {
    width: 'auto',
    height: 32,
  },
  path: {
    fill: '#7c3aed',
  },
  text: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

const LogoFull = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <svg
        className={classes.svg}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className={classes.path}
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        />
      </svg>
      <span className={classes.text}>
        DevOpsCanvas
      </span>
    </div>
  );
};

export default LogoFull;