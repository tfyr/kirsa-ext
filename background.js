var tabId
chrome.runtime.onInstalled.addListener(() => {
    //chrome.storage.sync.set({ color });
    //console.log('Default background color set to %cgreen', `color: ${color}`);
    //barcodeScannerCreating();
});


function createTab(url){
    chrome.tabs.create({ url: url }).then(tab=>{
        tabId=tab.id
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("background barcode: ", request);
    let queryOptions = { active: true, currentWindow: true };
    //let tab = await chrome.tabs.query(queryOptions);
    //console.log(tab)
    if (request.barcode && request.barcode.startsWith('http')){
        let created=false
        if (tabId){
            //chrome.tabs.sendMessage(tabId, {url: request.barcode}, function(response) {});        
            chrome.tabs.update(tabId, { url: request.barcode, active: true }).then(t=>{
            }).catch(c=>{
                console.log('catch', c)
                createTab(request.barcode)
            });
            /*chrome.tabs.get(tabId).then(tab=>{
                debugger
                tab.url=request.barcode
                chrome.tabs.sendMessage(tab.id, {url: request.barcode}, function(response) {});        
            })*/
            /*chrome.tabs.query({ tabId: tabId }).then((tabs)=>{
                debugger
                if (tabs.length>0){
                    chrome.tabs.sendMessage(tabs[0].id, {url: request.barcode}, function(response) {});        
                    created=true
                }
            });*/
        } 
        else {
            createTab(request.barcode);
        }
        /*chrome.tabs.query(queryOptions).then((tabs)=>{
            if (tabs.length>0){
                chrome.tabs.sendMessage(tabs[0].id, {url: request.barcode}, function(response) {});        
            }
        });*/
    } else {
        chrome.tabs.query(queryOptions).then((tabs)=>{
            if (tabs.length>0){
                chrome.tabs.sendMessage(tabs[0].id, {barcode: request.barcode}, function(response) {});        
            }
        });
    }

});


