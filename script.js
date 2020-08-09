$(document).ready(function () {

    var options = {fonts: {extendedJsFonts: true}}
    
    var content = document.getElementById("EI-content")
    getEnvironment(content);
    getLocationFromIPAddress();
    var content = document.getElementById("HI-content");
    getHardwareInfo(content);
    var content = document.getElementById("PF-content");
    getPersonalInfo(content);
    getInfoSensor("PF-5-value");

    if (window.requestIdleCallback) {
        requestIdleCallback(function () {
            Fingerprint2.get(options, function (res) {
                showSI(res);
            })
        })
    } else {
        setTimeout(function () {
            Fingerprint2.get(options, function (res) {
                showSI(res);
            })
        }, 2000)
    }
});

function getHardwareInfo(content) {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl.getExtension("WEBGL_debug_renderer_info");

    content.innerHTML += `<tr><td id="HI-0-field">CPU virtual cores</td>` +
        `<td id="HI-0-value">${window.navigator.hardwareConcurrency}</td></tr>`;

    content.innerHTML += `<tr><td id="HI-1-field">Touch compatibility</td>` +
        `<td id="HI-1-value">${navigator.maxTouchPoints}</td></tr>`;

    content.innerHTML += `<tr><td id="HI-2-field">Vendor WebGL</td>` +
        `<td id="HI-2-value">${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}</td></tr>`;

    content.innerHTML += `<tr><td id="HI-3-field">Renderer WebGL</td>` +
        `<td id="HI-3-value">${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}</td></tr>`;

    content.innerHTML += `<tr><td id="HI-4-field">DeviceRTC info</td>` +
        `<td id="HI-4-value"></td></tr>`;

}

function getPersonalInfo(content) {
    var client = new ClientJS()

    content.innerHTML += `<tr><td id="PF-0-field">Language</td>` +
        `<td id="PF-0-value">${client.getLanguage()}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-1-field">Screen resolution</td>` +
        `<td id="PF-1-value">${screen.width}x${screen.height}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-2-field">Color depth</td>` +
        `<td id="PF-2-value">${screen.colorDepth}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-2-field">devicePixelRatio</td>` +
        `<td id="PF-2-value">${window.devicePixelRatio}</td></tr>`;


        content.innerHTML += `<tr><td id="PF-2-field">window.screen.availHeight</td>` +
        `<td id="PF-2-value">${window.screen.availHeight}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-2-field">window.screen.availWidth</td>` +
    `<td id="PF-2-value">${window.screen.availWidth}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-3-field">Time zone</td>` +
        `<td id="PF-3-value">${new Date().toTimeString().slice(9,18)}</td></tr>`;

    content.innerHTML += `<tr><td id="PF-4-field">Font list</td>` +
        `<td id="PF-4-value"></td></tr>`;

    content.innerHTML += `<tr><td id="PF-5-field">Sensor orientation</td>` +
        `<td id="PF-5-value"></td></tr>`;
}

function getEnvironment(content) {
    content.innerHTML += `<tr><td id="EI-0-field">IP address</td>` +
        `<td id="EI-0-value"></td></tr>`;
    content.innerHTML += `<tr><td id="EI-1-field">Country code</td>` +
        `<td id="EI-1-value"></td></tr>`;
    content.innerHTML += `<tr><td id="EI-2-field">Continent code</td>` +
        `<td id="EI-2-value"></td></tr>`;

    content.innerHTML += `<tr><td id="EI-3-field">Latitude</td>` +
        `<td id="EI-3-value"></td></tr>`;
    content.innerHTML += `<tr><td id="EI-4-field">Longitude</td>` +
        `<td id="EI-4-value"></td></tr>`;
}

function getLocationFromIPAddress() {
    var request = new XMLHttpRequest();

    request.open('GET', 'https://api.ipdata.co/?api-key=test');

    request.setRequestHeader('Accept', 'application/json');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            //console.log(this.responseText);
            document.getElementById('EI-0-value').innerText = JSON.parse(this.responseText).ip;
            document.getElementById('EI-1-value').innerText = JSON.parse(this.responseText).country_code;
            document.getElementById('EI-2-value').innerText = JSON.parse(this.responseText).continent_code;
            document.getElementById('EI-3-value').innerText = JSON.parse(this.responseText).latitude;
            document.getElementById('EI-4-value').innerText = JSON.parse(this.responseText).longitude;
        }
    };

    request.send();
}

function sendData(jsonHH, jsonHI, jsonPF, jsonEI, jsonFI) {
    console.log(window.localStorage);
    let bfzp = window.localStorage.getItem('bfzp');

    if (bfzp){
        axios.post('/user/validate', {
            bfzp:bfzp
        }).then((res) => {
            console.log('[SUCCESS] Response from server');
            console.log(res);
            if (res.data.isValidated)
            {
                document.getElementById("BF-fingerprint").innerText = bfzp;
                document.getElementById("AN-announcement").innerText = res.data.message;
            }else{
                document.getElementById("BF-fingerprint").innerText = "Loading...";
                document.getElementById("AN-announcement").innerText = res.data.message+"...retrieving from server...";
                
                serviceSendInfoJson(jsonHH,jsonHI,jsonPF,jsonEI,jsonFI)
            }
        }).catch((err) => {
            console.log('[ERROR] Send data to server fail')
            console.log(err);
        })
    }else
    {
        serviceSendInfoJson(jsonHH,jsonHI,jsonPF,jsonEI,jsonFI)   
    }
}

function serviceSendInfoJson(jsonHH,jsonHI,jsonPF,jsonEI,jsonFI){
    axios.post('/user/info', {
        jsonHH: jsonHH,
        jsonHI: jsonHI,
        jsonPF: jsonPF,
        jsonEI: jsonEI,
        jsonFI: jsonFI
    }).then((res) => {
        console.log('[SUCCESS] Response from server: ');
        console.log(res);

        fingerprint = res.data.fingerprint;
        document.getElementById("BF-fingerprint").innerText = fingerprint;
        document.getElementById("AN-announcement").innerText = res.data.message;
        window.localStorage.setItem('bfzp',fingerprint);
    
    }).catch((err) => {
        console.log('[ERROR] Send data to server fail')
        console.log(err);
    })
}

function showSI(components) {
    var newComp = {};
    for (let i = 0; i < components.length; ++i) {
        newComp[components[i].key] = components[i].value;
    }

    // Hash the canvas and webgl for better visibility
    newComp['canvas'] = Fingerprint2.x64hash128(newComp['canvas'].join(''), 31);
    newComp['webgl'] = Fingerprint2.x64hash128(newComp['webgl'].join(''), 31);

    document.getElementById("PF-4-value").innerText = `${newComp['fonts']}`;

    var FIContent = document.getElementById("FI-content")

    FIContent.innerHTML += `<tr><td id="FI-0-field">Canvas</td>` +
        `<td id="FI-0-value">${newComp['canvas']}</td></tr>`;
    FIContent.innerHTML += `<tr><td id="FI-1-field">WebGL</td>` +
        `<td id="FI-1-value">${newComp['webgl']}</td></tr>`;
    FIContent.innerHTML += `<tr><td id="FI-2-field">Audio</td>` +
        `<td id="FI-2-value"></td></tr>`;

    run_pxi_fp("FI-2-value", function () {
        DetectRTC.load(function () {
            if (DetectRTC.MediaDevices.length == 0) 
            {
                document.getElementById("HI-4-value").innerText = "Can not detect"
            } 
            else 
            {
                document.getElementById("HI-4-value").innerText = `${DetectRTC.audioInputDevices.length} microphone - ` +
                    `${DetectRTC.audioOutputDevices.length} speaker - ` +
                    `${DetectRTC.videoInputDevices.length} camera`;
            }

            var jsonHeader = {};
            for (i = 0; i < 12; i++) {
                jsonHeader[document.getElementById(`HH-${i}-field`).innerText] =
                    document.getElementById(`HH-${i}-value`).innerText;
            }

            var jsonHardware = {};
            for (i = 0; i < 5; i++) {
                jsonHardware[document.getElementById(`HI-${i}-field`).innerText] =
                    document.getElementById(`HI-${i}-value`).innerText;
            }

            var jsonPersonal = {};
            for (i = 0; i < 5; i++) {
                jsonPersonal[document.getElementById(`PF-${i}-field`).innerText] =
                    document.getElementById(`PF-${i}-value`).innerText;
            }

            var jsonEnvironment = {};
            for (i = 0; i < 5; i++) {
                jsonEnvironment[document.getElementById(`EI-${i}-field`).innerText] =
                    document.getElementById(`EI-${i}-value`).innerText;
            }

            var jsonFingerprint = {};
            for (i = 0; i < 3; i++) {
                jsonFingerprint[document.getElementById(`FI-${i}-field`).innerText] =
                    document.getElementById(`FI-${i}-value`).innerText;
            }

            sendData(jsonHeader, jsonHardware, jsonPersonal, jsonEnvironment, jsonFingerprint)
        });
    });
}