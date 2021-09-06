var bodyEl = document.getElementsByTagName("body")[0];
/**
 * 
 * @param {Node} node 
 * @param {string} prop 
 * @returns {boolean}
 */
function findAttr(node, prop) {
    for (let n in node.attributes) {
        if (node.attributes[n].name == prop)
            return node.attributes[n].value;
    }
    return false;
}

/**
 * 
 * @param {Node} node 
 * @param {Node[]} res 
 * @param {string} query 
 */
function findNodesWithAttr(node, res, query) {
    if (findAttr(node, query)) res.push(node)
    for (let n of node.childNodes) {
        findNodesWithAttr(n, res, query);
    }
}

var appRoot = [];
findNodesWithAttr(bodyEl, appRoot, 'sk-app');
console.log(appRoot);

var scope = {};
scope.myVar = "abcd";
scope.name = "efwefewfeg";
/**
 * 
 * @param {Node} root 
 */
function renderValue(root = appRoot[0]) {
    if (findAttr(root, 'sk-repeat')) {
        var prop = findAttr(root, 'sk-repeat');

    }
    for (let n in root.childNodes) {
        if (root.childNodes[n].nodeType == 3) {
            root.childNodes[n].textContent = extractInterpolation(root.childNodes[n].textContent, scope);
        }

        else if (root.childNodes[n].nodeType == 1) {
            renderValue(root.childNodes[n]);
        }
    }

}

/**
 * 
 * @param {Node} root 
 * @param {string} prop 
 */
function renderLoop(root, prop) {
    var [iter, src] = prop.split(',');
    var innerTx = root.innerHTML
    root.innerHTML = ""
    var dataList = scope[src]
    var lnt = dataList.length
    for (let n = 0; n < lnt; n++) {
        root.innerHTML += innerTx
    }
}

function gtl(x) {
    return document.getElementById(x)
}

/**
 * 
 * @param {string} s 
 */
function extractInterpolation(s, scope) {
    var start1 = -1;
    var start2 = -1;
    var end1 = -1;
    var end2 = -1;
    var res = "";
    var tempst = "";

    var isPropSelecting = 0;
    var tempProp = '';
    for (let n = 0; n < s.length; n++) {
        if (s[n] == '{') {
            if (start1 == -1) start1 = n;
            else if (start1 == n - 1) { start2 = n; isPropSelecting = 1; }
        }
        else if (s[n] == '}' && start2 != -1) {
            if (end1 == -1) end1 = n;
            else if (end1 == n - 1) {
                end2 = n;
                var data = scope[tempProp];
                if (tempProp.split('.').length > 1) {
                    tempProp = tempProp.split('.')[1];
                }
                if (data) {
                    tempst += data
                }
                isPropSelecting = 0
                tempProp = ""
            }
            else {
                tempProp = ""
                isPropSelecting = 0
            }
        }
        else {
            if (isPropSelecting) tempProp += s[n]
            else tempst += s[n];
        }


    }
    return tempst
}

renderValue()