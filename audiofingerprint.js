function set_result(result, element_id) {
    pre = document.getElementById(element_id);
    pre.innerHTML = result;
}

function get_result(element_id) {
    pre = document.getElementById(element_id);
    return pre.innerHTML;
}

// Performs fingerprint as found in https://client.a.pxi.pub/PXmssU3ZQ0/main.min.js
var pxi_output;
var pxi_full_buffer;
var audioHash;

function run_pxi_fp(idTagToShow, next) {
    try {
        if (context = new(window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100), !context) {
            pxi_output = 0;
        }

        // Create oscillator
        pxi_oscillator = context.createOscillator();
        pxi_oscillator.type = "triangle";
        pxi_oscillator.frequency.value = 1e4;

        // Create and configure compressor
        pxi_compressor = context.createDynamicsCompressor();
        pxi_compressor.threshold && (pxi_compressor.threshold.value = -50);
        pxi_compressor.knee && (pxi_compressor.knee.value = 40);
        pxi_compressor.ratio && (pxi_compressor.ratio.value = 12);
        pxi_compressor.reduction && (pxi_compressor.reduction.value = -20);
        pxi_compressor.attack && (pxi_compressor.attack.value = 0);
        pxi_compressor.release && (pxi_compressor.release.value = .25);

        // Connect nodes
        pxi_oscillator.connect(pxi_compressor);
        pxi_compressor.connect(context.destination);

        // Start audio processing
        pxi_oscillator.start(0);
        context.startRendering();
        context.oncomplete = function (evnt) {
            pxi_output = 0;
            var sha1 = CryptoJS.algo.SHA1.create();
            for (var i = 0; i < evnt.renderedBuffer.length; i++) {
                sha1.update(evnt.renderedBuffer.getChannelData(0)[i].toString());
            }
            hash = sha1.finalize();
            pxi_full_buffer_hash = hash.toString(CryptoJS.enc.Hex);

            set_result(pxi_full_buffer_hash,idTagToShow);
            for (var i = 4500; 5e3 > i; i++) {
                pxi_output += Math.abs(evnt.renderedBuffer.getChannelData(0)[i]);
            }
            pxi_compressor.disconnect();
            next();
        }
    } catch (u) {
        pxi_output = 0;
    }
}
// End PXI fingerprint