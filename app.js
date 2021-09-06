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

var scope = {};
scope.myVar = "shahriar";
scope.name = "efwefewfeg";
scope.datas = [
    { name: "www", "roll": 44 },
    { name: "www1", "roll": 441 },
    { name: "www2", "roll": 442 }
]
/**
 * 
 * @param {Node} root 
 */
function renderValue(root = appRoot[0], iteratorName = null, iteratorObject = null) {
    if (findAttr(root, 'sk-loop')) {
        var prop = findAttr(root, 'sk-loop');
        renderLoop(root, prop)
        return
    }
    if (root.nodeType == 3) {
        root.textContent = extractInterpolation(root.textContent, scope, iteratorName, iteratorObject);
    }
    for (let n in root.childNodes) {
        if (root.childNodes[n].nodeType == 3) {
            root.childNodes[n].textContent = extractInterpolation(root.childNodes[n].textContent, scope, iteratorName, iteratorObject);
        }

        else if (root.childNodes[n].nodeType == 1) {
            renderValue(root.childNodes[n], iteratorName, iteratorObject);
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
    let innerTx = root.innerHTML
    root.innerHTML = ""
    var dataList = scope[src]
    var lnt = dataList.length
    for (let n = 0; n < lnt; n++) {
        var iteratorName = iter
        var iteratorObject = dataList[n]
        var temporaryContainer = document.createElement('div')
        temporaryContainer.innerHTML = innerTx
        root.appendChild(temporaryContainer)
        renderValue(temporaryContainer, iteratorName, iteratorObject)
    }
}

function gtl(x) {
    return document.getElementById(x)
}
/**
 * 
 * @param {Node} node 
 */
function copyNode(node) {
    var newNode = document.createElement(node.nodeName)
    newNode.attributes = node.attributes
    newNode.innerHTML = node.innerHTML
    return newNode
}

/**
 * 
 * @param {string} s 
 */
function extractInterpolation(s, scope, iteratorName = null, iteratorObject = null) {
    var start1 = -1;
    var start2 = -1;
    var end1 = -1;
    var end2 = -1;
    var res = "";
    var tempst = "";

    var isPropSelecting = 0;
    var tempProp = '';
    for (let n = 0; n < s.length; n++) {
        if (s[n] == '\n') {
            continue
        }
        if (s[n] == '{') {
            if (start1 == -1) start1 = n;
            else if (start1 == n - 1) { start2 = n; isPropSelecting = 1; }
        }
        else if (s[n] == '}' && start2 != -1) {
            if (end1 == -1) end1 = n;
            else if (n && end1 == n - 1) {
                end2 = n;
                console.log(tempProp);
                var data = null
                var tempPropSplit = tempProp.split('.')
                var property
                if (tempPropSplit[0] == iteratorName) {
                    property = iteratorObject
                    for (let n = 1; n < tempPropSplit.length; n++) {
                        property = property[tempPropSplit[n]]
                    }
                }
                else {
                    property = scope
                    for (let n = 0; n < tempPropSplit.length; n++) {
                        property = property[tempPropSplit[n]]
                    }
                }

                data = property
                if (data) {
                    tempst += data
                }
                isPropSelecting = 0
                tempProp = ""
                start1 = -1
                end1 = -1

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