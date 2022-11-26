/*async function connectSerial(manual, filters=[], openOptions={baudRate: 250000}) {
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

export {connectSerial}
*/