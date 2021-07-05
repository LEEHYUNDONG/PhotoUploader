import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import { Video, Audio } from 'expo-av';
import * as FaceDetector from 'expo-face-detector';

const WINDOW_HEIGHT = Dimensions.get("window").height;

export default function FaceRegistration() {
  const [hasVideoPermission, setHasVideoPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  //facedetector
  const [faces, setFaces] = useState([]);
  const [len, setLen] = useState(0);
  // const [b, setB] = useState(null);
  // const [f, setF] = useState(null);
  // const [r, setR] = useState(null);
  // const [y, setY] = useState(null);
  //video
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [preview, setPreview] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [cameraSource, setCameraSource] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const cameraRef = useRef();
  const [detectFace, setDetectFace] = useState(true);
  const [singleFile, setSingleFile]=useState(null);
    
  //얼굴인식하면 정보 저장
  const faceDetected = ({ faces }) => {
    if(faces.length > 0){
      if(detectFace){
        setDetectFace(false);
      }
      setFaces({faces});
      setLen(faces.length);
      // setB(faces[0].bounds);
      // setF(faces[0].faceID);
      // setR(faces[0].rollAngle);
      // setY(faces[0].yawAngle);
      console.log({faces});
    }else{
      setFaces({faces});
      setLen(faces.length);
      console.log({faces});
    }
  };

  //첫얼굴 인식시 자동동영상촬영시작
  useEffect(() => {
    if(!detectFace){
      videotimer();
    }
  }, [detectFace]);

  //카메라권한
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();     
      setHasVideoPermission(status === 'granted');
    })();
  }, []);

  //오디오권한
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasAudioPermission(status === 'granted');
    })();
  }, []);

  if (hasVideoPermission === null) {
    return <View />;
  }
  if (hasVideoPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (hasAudioPermission === null) {
    return <View />;
  }
  if (hasAudioPermission === false) {
    return <Text>No access to audio</Text>;
  }

  //viedo
  //카메라가 사진이나 비디오를 캡쳐할 준비가되었는지 구분
  const CameraReady = () => {
    setCameraReady(true);
  };
  //사진찍기
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: false, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      if (source) {
        await cameraRef.current.pausePreview();
          //setPreview(true);
          
        console.log("picture source :", source);
          setCameraSource(source);
      }
      if (source != null) {
        // If file selected then create FormData
            //const fileToUpload=singleFile.uri;
            //setSingleFile(source);
        //console.log("hhhh", singleFile);
        const name="B811226.jpg";
        const data = new FormData();
        data.append("title", "Image Upload");
        data.append("image", {
            name: name,
            type: "image/jpg",
            uri: source
        });
        console.log(data);
        // Please change file upload URL
        let res = await fetch("http://18.219.85.27:8000/images/", {
                method: "post",
                body: data,
                headers: {
                "Content-Type": "multipart/form-data"
            }
        });
  
        //console.log(res);
        let responseJson = await res.json();
        console.log(responseJson);
        if (responseJson.status == 1) {
          console.log("Upload Successful");
        }
      } else {
        // If no file selected the show alert
        console.log("Please Select File first");
      }
      await cameraRef.current.resumePreview();
    }
  };

  //사진 또는 비디오 미리보기 취소
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setPreview(false);
    setCameraSource(null);
    setVideoSource(null);
  };
  //미리보기 취소버튼
  const cancelPreviewButton = () => (
    <TouchableOpacity onPress={cancelPreview} style={styles.closeButton}>
      <View style={[styles.closeX, { transform: [{ rotate: "50deg" }] }]} />
      <View style={[styles.closeX, { transform: [{ rotate: "-50deg" }] }]} />
    </TouchableOpacity>
  );
  //녹화된비디오재생
  const playVideo = () => (
    <Video
      source={{ uri: videoSource }}
      shouldPlay={true}
      style={styles.media}
    />
  );

  //녹화중표시
  const videoRecordingDisplay = () => (
    <View style={styles.recordingContainer}>
      <View style={styles.recordCircle} />
      <Text style={styles.recordingPhrase}>{"Recording.."}</Text>
    </View>
  );

  //자동 녹화시작,중지
  const videotimer = async () => {
    setTimeout(() => {
      recordVideo();
    }, 500);
    setTimeout(() => {
      stopVideoRecording();
    }, 6000);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.cameracontainer}
        type={cameraType}
        flashMode={Camera.Constants.FlashMode.on}
        onCameraReady={CameraReady}
        onMountError={(error) => {
          console.log("cammera error", error);
        }}
        //onFacesDetected={faceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.none,
          runClassifications: FaceDetector.Constants.Classifications.none,
          minDetectionInterval: 500,
          tracking: true,
        }}
      />
      {/* <View style={styles.container}>
        {videoRecording && videoRecordingDisplay()}
        {videoSource && playVideo()}
        {preview && cancelPreviewButton()}
      </View>
      {len > 0
        ?
        <View></View>    
        :
        <View style={styles.container}>
          <Text style={styles.faceText}>얼굴이 인식되지 않았습니다.</Text>
        </View>
          } */}
          <TouchableOpacity
              style={styles.capture}
              onPress={takePicture}
          />
          
    </SafeAreaView>
  );
}

//style
const styles = StyleSheet.create({
  //카메라 컨테이너
  cameracontainer: {
    flex: 1.0,
  },
  //단순 텍스트
  text: {
    fontSize: 15,
    color: 'black',
  },
  // face: {
  //   justifyContent: 'center',
  //   backgroundColor: 'transparent',
  //   position: 'absolute',
  //   borderColor: '#808000',
  //   padding: 10,
  //   borderWidth: 1,
  //   borderRadius: 1, 
  // },
  //얼굴인식유무 텍스트
  faceText: {
    color: '#11CC11',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  //video style
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  //미리보기 취소
  closeButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c5c5c5",
    position: "absolute",
    height: Math.floor(WINDOW_HEIGHT * 0.03),
    width: Math.floor(WINDOW_HEIGHT * 0.03),
    borderRadius: Math.floor(Math.floor(WINDOW_HEIGHT * 0.03) / 2),
    top: 35,
    left: 15,
    opacity: 0.7,
    zIndex: 2,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  //미리보기 x모양
  closeX: {
    width: "70%",
    height: 1,
    backgroundColor: "white",
  },
  //조작버튼
  // control: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   position: "absolute",
  //   flexDirection: "row",
  //   bottom: 40,
  //   width: "100%",
  // },
  //촬영버튼
  capture: {
    backgroundColor: "#cfcfcf",
    borderRadius: 2,
    height: Math.floor(WINDOW_HEIGHT * 0.1),
    width: Math.floor(WINDOW_HEIGHT * 0.1),
    borderRadius: Math.floor(Math.floor(WINDOW_HEIGHT * 0.1) / 2),
    marginHorizontal: 150,
    marginBottom: 5,
    
  },
  //녹화중표시 컨테이너
  recordingContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "absolute",
    backgroundColor: "transparent",
    top: 25,
    opacity: 0.7,
  },
  //녹화중표시 문구
  recordingPhrase: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  //녹화중표시 원
  recordCircle: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
});