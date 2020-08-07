function getInfoSensor(id) {
  console.log("Get info sensor")
  let content = document.getElementById(id);

  const options = {
    frequency: 5,
    referenceFrame: 'device'
  };
  const sensor = new AbsoluteOrientationSensor(options);

  sensor.start();
  sensor.onerror = event => {
    console.log(event.error.name, event.error.message)
    content.innerText = "Can not detect"
  };

  sensor.onreading = () => {
    let xyzw = sensor.quaternion;
    content.innerText ="X="+ Number((xyzw[0]).toFixed(3))+" Y="+Number((xyzw[1]).toFixed(3))+ " Z="+Number((xyzw[2]).toFixed(3))+" W="+Number((xyzw[3]).toFixed(3));
  };
}