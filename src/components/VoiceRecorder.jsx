import React, { useState, useRef } from "react";
import { Button, Card, Grid, IconButton, Typography} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { Container } from "@mui/system";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import axios from "axios";

let mediaRecorder = [];
let chunks = [];

export default function VoiceRecorder() {
  const [text, setText] = useState("Hold the record button to record");
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
   const [snackBar, setSnackBar] = useState(false);

  // const [translate, setTranslate] = useState("");
  const record = useRef(null);
  const stop = useRef(null);
  const textRef = useRef(null);
  // const translateRef = useRef(null);

const handleClick = (newState) => () => {
    setSnackBar(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBar(false);
  };
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          setText("Processing...");
          // setTranslate("");

          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          chunks = [];

          let data = new FormData();
          data.append("file", blob, "test.ogg");
          console.log(data)
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          axios
            .post("/api/voice", data, config)
            .then((response) => {
              setText(response.data.text);
              setFileName(response.data['file_name']);
              setLoading(true)
              // setTranslate(response.data.translate);

            })
            .catch((err) => console.log(err));
        };

        record.current.onpointerdown = () => {
          if (loading){
            handleClick({
          vertical: 'top',
          horizontal: 'center',
        })()
            return
          }

          textRef.current.innerHTML = "Recording...";
          record.current.style.color = 'red'
          record.current.style.width = '100px'
          record.current.style.height = '100px'
          record.current.style.backgroundColor = '#f18294'
          record.current.style.top = "25px"
          // translateRef.current.innerHTML = "";
          mediaRecorder.start();
        };

        record.current.onpointerleave = () => {
          record.current.style.color = 'rgba(0, 0, 0, 0.54)'
          record.current.style.backgroundColor = '#FFF'
          record.current.style.width = '50px'
          record.current.style.height = '50px'
          record.current.style.top = "-12.5px"
          mediaRecorder.stop();
        };
      })
      .catch((err) => {
        console.error(`The following getUserMedia error occurred: ${err}`);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

  const handleValidation = (isValid)=>{

    const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
    const data = JSON.stringify({
      "file_name":fileName,
      "is_valid":isValid,
      "text":text
    })

    axios.post('/api/validate', data, config).then((response)=>{
    }).catch((err)=>{
      console.log(err)
    })
    setLoading(false)
    setText("Hold the record button to record")
  }
  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      <Grid container direction="column" justifyContent='space-between'>
        <Grid item mb={3}>
          <Card>
            <Typography ref={textRef} p={3}>
              {text}
            </Typography>
          </Card>
        </Grid>
        {/*<Grid item mt={2}>*/}
        {/*  <Card>*/}
        {/*    <Typography ref={translateRef} p={3} dir="rtl">*/}
        {/*      {translate}*/}
        {/*    </Typography>*/}
        {/*  </Card>*/}
        {/*</Grid>*/}
        {loading && <>
          <Grid container direction='row' justifyContent='space-between' alignContent='center' alignSelf='center'  px={1} py={2}>

            <Grid item alignSelf='center'>
              <IconButton color='error' onClick={()=> handleValidation(false)}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item alignSelf='center'>
              <IconButton color='success' onClick={()=> handleValidation(true)}>
                <CheckIcon />
              </IconButton>
            </Grid>
            <Grid item  alignSelf='center' ml={1}>

              <Typography dir="rtl" >
                آیا متن تولید شده صحیح می باشد؟
              </Typography>

            </Grid>

          </Grid>

        </>}
        <Grid item  alignSelf="center" position='absolute' bottom={70}>
          <IconButton ref={record} size="large">
            <KeyboardVoiceIcon fontSize="large" />
          </IconButton>
        </Grid>
        <div>
        <Snackbar
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
        open={snackBar}
        onClose={handleClose}
        autoHideDuration={2000}
      >
            <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
              لطفا نظر خود در مورد متن تولید شده را ثبت کنید
            </Alert>
        </Snackbar>
          </div>
      </Grid>
    </Container>
  );
}
