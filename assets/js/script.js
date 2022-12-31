function getStarted(){
    document.getElementById("start-button").style.left = "-100vw";
    document.getElementById("get-data-group").style.left = "10vw";
}

function slideinStartMinifyGroup() {
    document.getElementById("get-data-group").style.left = "110vw";
    document.getElementById("get-data-group").style.opacity = "0";
    document.getElementById("start-minify-group").style.left = "10vw";
}

function slideinDownloadGroup() {
    document.getElementById("start-minify-group").style.left = "110vw";
    document.getElementById("start-minify-group").style.opacity = "0";
    document.getElementById("download-group").style.left = "10vw";
    document.getElementById("reload-group").style.visibility = "visible";
}

function copyText(){
    let newTarget = document.getElementById("copy-area");
    newTarget.value = document.getElementById("target").innerText;
    newTarget.select();
    newTarget.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(newTarget.value);
    
    newTarget.blur();
    document.getElementById("copy-confirm").innerText = "copied";
};

function pasteText(){
    document.getElementById("target").innerHTML = ""; // clear the textarea
    navigator.clipboard.readText().then(text => document.getElementById("source").innerText = text)
        .then(text => quickCheckDataType(text.substring(0,20)));
};

function quickCheckDataType(substring) {
    slideinStartMinifyGroup();
    if (substring.match(/<\!DOC|<html|\<\!\-\-/i)) {setDownloadType("html");}
    else if (substring.match(/\{|\*|\@/)) {setDownloadType("css");}
    else if (substring.match(/const|fun|impor/)) {setDownloadType("js");}
    else {setDownloadType("txt")};
}

function minifyHTML(){
    let source = document.getElementById("source").innerText;
    let target = source
        .replace(/(?=(\<\!\-\-))(.*)(\-\-\>)/g,"") // comments in html are surrounded by <!-- ... -->, so this regex is for comments.
        // it parses to this:  (?=(\<\!\-\-)) '(look ahead ?= from this group () <!-- all 4 chars escaped with '\', for everything (.*) until
        // you get to this group (\<\!\-\-) or '-->'. 
        .replace(/\n|\t/gm,"") // replace all line breaks
        .replace(/ +/gm," ") // this one is key: replace multiple spaces with just one, leaving only spaces between, e.g., table { border: 1px solid white; }, special chars and words next to them, where spaces have to be left between 1px and solid.
        .replace(/ \</gm,"<") // this and next 6 .replaces get rid of those extra spaces. next .replace shows a variation.
        .replace(/\s?=\>/gm,">") // this is the look ahead operator ?= which will be used in the last .replace. here it works the same as ' \<' right above it, so it doesn't actually do anything.
        .replace(/ \>/gm,">") // gets the leading space before the >. for example, <div > becomes <div>.
        .replace(/\: /gm,":")
        .replace(/\; /gm,";")
        .replace(/\, /gm,",")
        // thanks to regex101.com's tester that evaluates as you type. saved me a lot of testing.
        ;

    let x = source.length;
    let y = target.length;
    let z = `${((x-y)/x*100).toFixed(1)}%`;
    document.getElementById("target").innerText = target;
    document.getElementById("copy-area").value = target;
    printToScreen(x,y,z);
    setDownloadType("min.html");
    slideinDownloadGroup();
};

function minifyCSS(){
    let source = document.getElementById("source").innerText;
    let target = source
    // the regExes I've seen questions on in the forums were condensed, difficult to suss out for a beginner like me. this approach is much my style.
        .replace(/(?=(\/\*))(.*)(\*\/)/g,"") // comments in css are surrounded by /* ... */, so last regex is for comments.
        // last replace parses to this:  (?=(\/\*)) '(look ahead ?= from this group () /* both chars escaped with '\', for everything (.*) until
        // you get to this group (\*\/) or '*/
        .replace(/\n|\r/gm,"zap") // replace all line breaks
        .replace(/ +/g," ") // this one is key: replace multiple spaces with just one, leaving only spaces between, e.g., table { border: 1px solid white; }, special chars and words next to them, where spaces have to be left between 1px and solid.
        .replace(/ \{/g,"{") // this and next 6 .replaces get rid of those extra spaces. next .replace shows a variation.
        .replace(/\s?=\}/g,"}") // this is the look ahead operator ?= which will be used in the last .replace. here it works the same as ' \{' right above it.
        .replace(/\{ /g,"{") // gets the trailing space after the {
        .replace(/\: /g,":")
        .replace(/\; /g,";")
        .replace(/\, /g,",")
        .replace(/zap/g,"")
        // thanks to regex101.com's tester that evaluates as you type. saved me a lot of testing.
        ;
    let x = source.length;
    let y = target.length;
    let z = `${((x-y)/x*100).toFixed(1)}%`;
    document.getElementById("target").innerText = target;
    document.getElementById("copy-area").value = target;
    printToScreen(x,y,z);
    setDownloadType("min.css");
    slideinDownloadGroup();
};

function minifyJS(){
    let source = document.getElementById("source").innerText;
    let target = source
        // minifying js is more complicated than minifying html or css. i chose to use a string replacement to keep track of what i'd replaced.
        .replace(/(?=(\/\/)).*(\n|\r)/gm,"") // get comments of the // type, which are for single line comments or to-end-of-line comments, by searching from // to newline.
        .replace(/(?=(\/\*))(.*)(\*\/)/gm,"") // block comments in js are surrounded by /* ... */, so last regex is for comments.
            // last replace parses to this:  (?=(\/\*)) '(look ahead ?= from this group () /* both chars escaped with '\', for everything (.*) until
            // you get to this group (\*\/) or '*/
        .replace(/\n|\r/g,"zap") // replace newline characters
        .replace(/(?=(\/\*))(.*)(\*\/)/g,"") // run again to get block comments
        .replace(/\s*zap\s*/gm,"zap") // whitespace before (\s*) zap and after zap (\s*) until the next character
        .replace(/zap/g,"") // take out the zaps
        // // thanks to regex101.com's tester that evaluates as you type. saved me a lot of testing.
    ;
    let x = source.length;
    let y = target.length;
    document.getElementById("target").innerText = target;
    document.getElementById("copy-area").value = target;
    printToScreen(x,y);
    setDownloadType("min.js");
    slideinDownloadGroup();   
};

function encodeSVG() {
    let source = document.getElementById("source").innerText;
    let target = `data:image/svg+xml,${source.replaceAll("\r", "").replaceAll("\t", "").replaceAll("\n", "").replaceAll('"', "'").replaceAll("<", "%3C").replaceAll(">", "%3E").replaceAll("#", "%23")}`;
    let x = source.length;
    let y = target.length;
    document.getElementById("target").innerText = target;
    document.getElementById("copy-area").value = target;
    printToScreen(x,y);
    setDownloadType("URLencoded.svg");
    slideinDownloadGroup();   
}

function fileUpload(file) {
    document.getElementById("source").innerText = ""; // clear the textareas
    document.getElementById("target").innerText = ""; // clear the textareas
    document.getElementById("fileName").value = file.name.split(".")[0]; // pop off the opened file's extension and put the file name in the download filename userinput
    let reader = new FileReader(); // constructor function
    reader.readAsText(file); // read the file as text to get a text string
    reader.onloadend = function(){
        document.getElementById("source").innerText = reader.result; // paste file read result into source textarea
        document.getElementById("sourceb").innerText = reader.result.length;
        slideinStartMinifyGroup();
    }
};

function fontUpload(file) {
    document.getElementById("source").innerText = ""; // clear the textareas
    document.getElementById("target").innerText = ""; // clear the textareas
    document.getElementById("sourceb").innerText = file.size;
    document.getElementById("fileName").value = file.name; // put the full file name and extension in the download filename userinput
    let reader = new FileReader(); // constructor function
    reader.readAsDataURL(file); // read the file as text to get a text string
    reader.onloadend = function(){
        document.getElementById("target").innerText = reader.result; // paste file read result into source textarea
        document.getElementById("copy-area").value = reader.result;
        document.getElementById("targetb").innerText = reader.result.length;
        document.getElementById("get-data-group").style.left = "100vw";
        document.getElementById("get-data-group").style.opacity = "0";
        setDownloadType("b64.txt");
        slideinDownloadGroup();
    }
};

function fileDownload() {
    let filename = document.getElementById("fileName").value;
    let type = document.getElementById("downloadType").value;
    let text = document.getElementById("target").innerText;
    let ele = document.createElement("a"); // creating an element using the <a> download attribute to download the file
    
    ele.setAttribute("href",`data:text/plain,${encodeURIComponent(text)}`); // set encoding
    ele.setAttribute("download",`${filename}.${type}`); // set file type and file name, which in this case is just 'file', so the downloaded file will be named, and typed depending on what file type is selected, e.g. file.min.css
    ele.style.display = "none"; // make element hidden

    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);
};

function setDownloadType(type) {
    var options = document.getElementById("downloadType").options;
    for (n=0; n<options.length; n++) {
        if (options[n].value === type) {
        options.selectedIndex = n;
        break;
        }
    }
}

function printToScreen(x,y) {
    document.getElementById("sourceb").innerHTML = `${x/1000} kB`;
    document.getElementById("targetb").innerHTML = `${y/1000} kB`;
    document.getElementById("changep").innerHTML = `${((x-y)/x*100).toFixed(1)}%`;
};