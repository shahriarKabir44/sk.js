var bodyEl = document.getElementsByTagName("body")[0];
/**
 * 
 * @param {Node} node 
 * @param {string} prop 
 * @returns {boolean|string}
 */
function findAttr(node, prop) {
    for (let n in node.attributes) {
        if (node.attributes[n].name == prop)
            return node.attributes[n].value;
    }
    return false;
}
function deleteAttribute(node, prop) {
    for (let n in node.attributes) {
        if (node.attributes[n].name == prop)
            delete node.attributes[n]
    }
}
var positionTracker = new Map()

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
scope.name = { value: "shahriarKabir" };
scope.datas = [
    { name: "www", "roll": 44 },
    { name: "www1", "roll": 441 },
    { name: "www2", "roll": 442 },
    { name: "www22", "roll": 442 }

]
scope.nums = [1, 2]
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

        let st = extractInterpolation(root.textContent, scope, iteratorName, iteratorObject);
        root.textContent = st
    }
    for (let n in root.childNodes) {
        if (root.childNodes[n].nodeType == 3) {
            let st = extractInterpolation(root.childNodes[n].textContent, scope, iteratorName, iteratorObject);
            root.childNodes[n].textContent = st
        }

        else if (root.childNodes[n].nodeType == 1) {
            renderValue(root.childNodes[n], iteratorName, iteratorObject);
        }
    }

}

/**
 * 
 * @param {Node} currentNode 
 * @param {object} context 
 */
function processDOMs(currentNode, context) {
    console.log(context)
    if (currentNode.nodeType == 3) {
        let st = extractInterpolation(currentNode.textContent, context)
        currentNode.textContent = st
    }
    else {
        for (let n = 0; n < currentNode.childNodes.length; n++) {
            if (currentNode.childNodes[n].nodeType == 3) {
                let st = extractInterpolation(currentNode.childNodes[n].textContent, context)
                currentNode.childNodes[n].textContent = st
            }
            else {
                var tempNode = currentNode.childNodes[n]
                if (findAttr(tempNode, 'sk-loop')) {
                    renderRepeat(tempNode, context, n)
                }
                else {
                    processDOMs(tempNode, context)
                }
            }
        }
    }
}


/**
 * 
 * @param {Node} root 
 */
function renderRepeat(root, context, childIndex) {
    var prop = findAttr(root, 'sk-loop') + ''
    var [iterator, dataSource] = prop.split(',')
    if (!positionTracker.get(dataSource)) positionTracker.set(dataSource, [])
    var positionDetails = {
        targetNode: root,
        targetNodeIndex: childIndex,
        parent: root.parentElement
    }
    positionTracker.set(dataSource, [...positionTracker.get(dataSource), positionDetails])
    var dataArray = context[dataSource]
    var loopCount = dataArray.length
    var parentNode = root.parentElement;
    deleteAttribute(root, 'sk-loop')
    var siblingList = []
    for (let n = 0; n < parentNode.childNodes.length; n++) {
        if (n == childIndex) {
            for (let k = 0; k < loopCount; k++) {
                let newNode = (copyNode(root))
                let currentContext = [{ iteratorName: iterator, iteratorValue: dataArray[k], indexNumber: k }]
                if (context.localContexts) currentContext = [...context.localContexts, ...currentContext]
                if (!context.localContexts) context.localContexts = []
                processDOMs(newNode, { ...context, localContexts: currentContext })
                siblingList.push(newNode)
            }
        }
        else siblingList.push(parentNode.childNodes[n])
    }
    parentNode.innerHTML = ''
    for (let n of siblingList) {
        parentNode.appendChild(n)
    }

}
renderRepeat(gtl('targ').childNodes[1], scope, 1)

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
 * @param {HTMLElement} node 
 */
function copyNode(node) {
    var newNode = document.createElement(node.nodeName)
    newNode.attributes = node.attributes
    newNode.innerHTML = node.innerHTML
    newNode.style = node.style
    return newNode
}
/**
 * 
 * @param {Object} context 
 * @param {string} prop 
 */
function findData(context, prop) {
    var splitProp = prop.split('.')
    var property = context
    if (!property[splitProp[0]]) {
        for (let item of context.localContexts) {
            if (item.iteratorName == splitProp[0]) {
                let currentContext = item.iteratorValue
                for (let n = 1; n < splitProp.length; n++) {
                    currentContext = currentContext[splitProp[n]]
                }
                return currentContext
            }
        }

    }
    for (let n of splitProp) {
        property = property[n]
    }
    return property
}
//replaces placeholders with values
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
    var finalInnerString = "";

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

                var data = null

                data = findData(scope, tempProp)
                if (data) {
                    finalInnerString += (data)
                    console.log(tempProp, data);
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
            else finalInnerString += s[n];
        }


    }
    return finalInnerString
}

//renderValue()