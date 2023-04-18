const filters = [
    { usbVendorId: 0x0745, usbProductId: 0x0001 }, // CipherLab 1070
    { usbVendorId: 0x1a86, usbProductId: 0x5723 }, // Netum C750
    { usbVendorId: 0x05e0, usbProductId: 0x1701 }, // Motorola Symbol Zebra ds4308
    { usbVendorId: 0x05f9, usbProductId: 0x4204 }, // Dialogic QuickScan QQ2430
    { usbVendorId: 0x1eab, usbProductId: 0x1a06 }, // ???
    { usbVendorId: 0x324f, usbProductId: 0x0042 }, // Mertech NS021
    { usbVendorId: 0x2dd6, usbProductId: 0x214a }, // Mertech 2210
    { usbVendorId: 0x0c2e, usbProductId: 0x0caa }, // Honeywell 1450g2DHR
    //{ usbVendorId: 0x18d1, idProduct: 0x4ee4}
];

var serialScanner=null;

async function connectSerial(manual, filters=[], openOptions={baudRate: 250000}) {
    let port = null;
    const ports = await navigator.serial.getPorts();
    const filteredPorts = ports.filter(e => filters.find(ef => ef.usbVendorId==e.getInfo().usbVendorId && ef.usbProductId==e.getInfo().usbProductId))
    if (filteredPorts.length==1){
        port = filteredPorts[0];
    } else {
        if (manual){
            await navigator.serial.requestPort({filters})
                .then(x=>{port=x})
                .catch(async error => {
                    await navigator.serial.requestPort() // wide manual select without filters
                        .then(x=>{
                            port=x
                            console.log(port.getInfo())
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
        } else {
            if (filteredPorts.length>0) {
                port = filteredPorts[0];
            }
        }
    }
    if (port){
        try{
            await port.open(openOptions);
        } catch (InvalidStateError){
            //console.log('port already opened', InvalidStateError)
        }
    }
    return port;
}

function barcodeScannerCreating(){
    setTimeout(()=>{connectScanner(false)}, 250);
    navigator.serial.addEventListener("connect", (event) => {
        console.log('connect');
        if (!serialScanner)
            connectScanner(false)
    });
    navigator.serial.addEventListener("disconnect", (event) => {
        if (serialScanner && serialScanner==event.target){
            console.log('disconnect');
            document.dispatchEvent(new CustomEvent('kirsaExt', { detail: {msg: 'scanner disconnected'} }));
            serialScanner=null;
            //disconnectScanner();
        }
    });
}

async function connectScanner(manual){
    serialScanner = await connectSerial(manual, filters, {baudRate: 250000})
    this.trigger=true
    if (serialScanner){
        document.dispatchEvent(new CustomEvent('kirsaExt', { detail: {msg: 'scanner connected'} }));
    }
    while (serialScanner && serialScanner.readable && !serialScanner.readable.locked && this.trigger) {
        try {
            this.scannerReader = serialScanner.readable.getReader();
            /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
            let s = ''
            while (this.trigger) {
                const { value, done } = await this.scannerReader.read();
                if (done) {
                    break;
                }
                value.forEach(async e =>  {
                    // eslint-disable-next-line
                    if (e==10){
                    } else if (e==13){
                        console.log(s, chrome)
                        if (chrome.runtime)
                            chrome.runtime.sendMessage({barcode: s});
                        else
                            console.log('no runtime')
                        console.log('scanner host: "'+s+'"')
                        s = ''
                    } else
                        s += String.fromCharCode(e);
                });
            }
            //await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            console.log(error)
            break
        }
    }
}

document.addEventListener('toKirsaExt',async (params)=>{
    console.log("toKirsaExt", params);
    connectScanner(true);
});
barcodeScannerCreating();
/*let connectScannerButton = document.getElementById("connectScanner");

if (connectScannerButton){
    connectScannerButton.addEventListener("click", async () => {
        connectScanner(true);
    });
}*/



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.barcode) {
            console.log("last barcode: ", request.barcode);
            sendResponse({status: "done"});
            //console.log(vue)
            //chrome.storage.sync.set({'barcode': request.barcode}, function() {
            //    console.log('Value is set to ' + request.barcode);
            //});
            var data = {
                barcode: request.barcode,
            };
              
            document.dispatchEvent(new CustomEvent('kirsaExt', { detail: data }));
        } else if (request.url) {
            //window.open(request.url)
            window.location.href = request.url
            //debugger
            //document.getElementById("fireworks").src = request.url;
            /*let video = document.createElement("video")
            let source = document.createElement("source")
            source.setAttribute("type", "video/mp4")
            video.appendChild(source)
            document.body.appendChild(video) // insertBefore(newDiv, currentDiv);
            source.setAttribute("src", request.url)*/
        }

    }
);



// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}
