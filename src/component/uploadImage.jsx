  // export default App;
import React, { useState } from "react";
// Import core components
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";


const takePicture = async () => {
  if (cameraRef.current) {
    const options = { quality: 0.5, base64: true, skipProcessing: true };
    const data = await cameraRef.current.takePictureAsync(options);
    const source = data.uri;
    if (source) {
      await cameraRef.current.pausePreview();
      //setPreview(true);
      console.log("picture source :", source);
      setCameraSource(source);
    }
  }
};

export const onSnap=async () => {
    const [singleFile, setSingleFile] = useState(null);
    // Check if any file is selected or not
    if (singleFile != null) {
      // If file selected then create FormData
      const fileToUpload = singleFile.uri;
      //console.log("hhhh", singleFile);
      const data=new FormData();
      
      data.append("title", "B811226");
      data.append("image", {
        name: singleFile.name,
        type: "image/jpg",
        uri: singleFile.uri
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
        console.log("Upload Successful.");
      }
    } else {
      // If no file selected the show alert
      console.log("Please Tack a picture.");
    }
};
