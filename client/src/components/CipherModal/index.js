import React, { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import "./index.css";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1)
  }
}))(MuiDialogActions);

export default function CipherModal(props) {
  const { open, cipherText } = props;

  const [openModal, setOpenModal] = React.useState(false);

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  const handleClose = () => {
    setOpenModal(false);
  };

  const [copySuccess, setCopySuccess] = useState("");
  const cipherRef = useState(null);

  function copyToClipboard(e) {
    console.log("copy to clipboard");
    cipherRef.current.select();
    document.execCommand("copy");
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.focus();
    setCopySuccess("Copied!");
  }

  return (
    <div>
      {/* <Button variant="outlined" color="secondary" onClick={handleClickOpen}>
        Open dialog
      </Button> */}
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={openModal}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Keep this value! You will only see this once.
        </DialogTitle>
        <DialogContent dividers>
          {/* <Typography gutterBottom>{cipherText}</Typography> */}
          <input className="cipher-modal" ref={cipherRef} value={cipherText} />
        </DialogContent>
        <DialogActions>
          <Button onClick={copyToClipboard} color="primary">
            Copy to clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
