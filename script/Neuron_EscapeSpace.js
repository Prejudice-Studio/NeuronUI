const LOCAL_PLAYER_ID = getLocalPlayerUniqueID(); //自身ID
const setPos = p => setEntityPos(LOCAL_PLAYER_ID, p.x, p.y, p.z);
var status = false

function onTickEvent(){if (status){setPos({x: 1000,y: 100,z: 1000});}}

function onCallModuleEvent(data) {
    for (key in data) {
        if (key == "value" || key == "fun" || key == "name" || key == "index" || key == "key" || key == "shortcut") continue;
        if (data.index == undefined) eval(key + '=' + data[key])
    }
}

function onSendChatMessageEvent(message) { // 执行命令
    if (message == 'esexit') { // 退出脚本
        exit();
        clientMessage('次元空间已退出');
        return true;
    }
}

clientMessage("§b次元空间加载完毕")