// 建造工具
// 脚本示例
// 2024.8.10
// v1.0.2

// 父路径
const BASE_PATH = getResource();
// 数据路径
const DATA_PATH = BASE_PATH + '/data';

let CLICK_COPY = false;
let EXCLUDE_AIR = true;
let POS_DATA = {x: 0, y: 0, z: 0};
let BUILD_TASKS = [];
let BUILD_TASKS_SPEED = 5; // 任务速度

file_mkdirs(DATA_PATH);

// 读取文件
function readFile(path) {
    return read_file(path);
}

// 写入文件
function writeFile(path, data) {
    write_file(path, data);
}

// 状态转字符串
function bool2str(bool) {
    return bool ? '§2已打开' : '§c已关闭';
}

// 移除区块数据
function removeBlocksData(name) {
    try {
        file_delete(`${DATA_PATH}/${name}.json`);
    } catch (error) {
        clientMessage(`Failed to delete block data: ${error}`);
    }
}

// 保存区块数据
function saveBlocksData(name, blocks) {
    const json = JSON.stringify(blocks);
    try {
        writeFile(`${DATA_PATH}/${name}.json`, json);
    } catch (error) {
        clientMessage(`Failed to save block data: ${error}`);
    }
}

// 加载区块数据
function loadBlocksData(name) {
    try {
        const blocks = readFile(`${DATA_PATH}/${name}`);
        return JSON.parse(blocks);
    } catch (error) {
        clientMessage(`Failed to load block data: ${error}`);
        return null;
    }
}
// 获取区块数据
function getChunkBlocks(x1, y1, z1, x2, y2, z2) {
    const sx = Math.min(x1, x2);
    const sy = Math.min(y1, y2);
    const sz = Math.min(z1, z2);
    const ex = Math.max(x1, x2);
    const ey = Math.max(y1, y2);
    const ez = Math.max(z1, z2);
    const blocks = [];

    for (let hx = sx; hx <= ex; hx++) {
        for (let hy = sy; hy <= ey; hy++) {
            for (let hz = sz; hz <= ez; hz++) {
                const block = getBlock(hx, hy, hz);
                if (EXCLUDE_AIR && (block.id === 0 || block.namespace === 'minecraft:air')) {
                    continue;
                }
                blocks.push({
                    name: block.namespace,
                    aux: block.aux,
                    x: hx - sx,
                    y: hy - sy,
                    z: hz - sz
                });
            }
        }
    }
    return blocks;
}


// 显示建筑菜单
function showListMenu() {
    const menu = {
        type: 'form',
        title: '建筑列表',
        content: '请选择需要粘贴的建筑',
        buttons: [{text: '暂无数据'}]
    };
    const files = file_list(DATA_PATH);
    for (let i = 0; i < files.length; i++) {
        menu.buttons[i] = {
            text: files[i].name.replace('.json', ''),
            image: {type: 'path', data: 'textures/ui/default_world.png'}
        }
    }
    const json = JSON.stringify(menu);
    addForm(json, function (index) {
        if (files.length > 0 && index >= 0) {
            const blocks = loadBlocksData(files[index].name);
            if (blocks != null) {
                clientMessage('读取成功');
                BUILD_TASKS = blocks;
            } else {
                clientMessage('读取失败');
            }
        }
    });
}

// 显示移除菜单
function showRemoveListMenu() {
    const menu = {
        type: 'form',
        title: '建筑列表',
        content: '请选择需要移除的建筑',
        buttons: [{text: '暂无数据'}]
    };
    const files = file_list(DATA_PATH);
    for (let i = 0; i < files.length; i++) {
        menu.buttons[i] = {
            text: files[i].name.replace('.json', ''),
            image: {type: 'path', data: 'textures/ui/default_world.png'}
        }
    }
    const json = JSON.stringify(menu);
    addForm(json, function (index) {
        if (files.length > 0 && index >= 0) {
            removeBlocksData(files[index].name);
            clientMessage('移除成功');
        }
    });
}

// 显示坐标菜单
function showPosMenu() {
    const menu = `
       {
          "type": "custom_form",
          "title": "§b坐标复制",
          "content": [
            {
              "type": "input",
              "text": "保存名称"
            },
            {
              "type": "input",
              "placeholder": "例如 100,10,100",
              "text": "开始坐标"
            },
            {
              "type": "input",
              "placeholder": "例如 100,10,100",
              "text": "结束坐标"
            }
          ]
        }
    `;
    addForm(menu, function (name, start_pos, end_pos) {
        if (name != null && start_pos != null && end_pos != null) {
            const s = start_pos.split(',');
            const e = end_pos.split(',');
            if (name.length > 0 && s.length === 3 && e.length === 3) {
                const blocks = getChunkBlocks(Number(s[0]), Number(s[1]), Number(s[2]), Number(e[0]), Number(e[1]), Number(e[2]));
                saveBlocksData(name, blocks);
                clientMessage('保存成功');
            } else {
                clientMessage('输入错误');
            }
        }
    })
}

function bool2jsonValue(bool) {
    return bool ? 'true' : 'false';
}

//显示选项菜单
function showSettingMenu() {
    const value = bool2jsonValue(EXCLUDE_AIR)
    addForm(`{"type":"custom_form","title":"§b修改选项","content":[{"type":"slider","text":"建造速度","min":1,"max":20,"step":1,"default":${BUILD_TASKS_SPEED}},{"type":"toggle","text":"排除空气","default":${value}}]}`, function (speed, toggle) {
        if (speed != null && speed > 0) {
            BUILD_TASKS_SPEED = speed;
            EXCLUDE_AIR = toggle;
            clientMessage('§e保存成功');
        }
    }, function () {
        clientMessage('§e没有选择保存');
    })
}

//显示主菜单
function showMainMenu() {
    const menu = `{
        "type": "form",
        "title": "§a建筑菜单",
        "content": "§e请选择需要执行的操作",
        "buttons": [
            {
                "text": "§b两点复制 §e(点击两个位置复制)",
                "image": {
                    "type": "path",
                    "data": "textures/ui/anvil_icon.png"
                }
            },
            {
                "text": "§b坐标复制 §e(输入具体坐标复制)",
                "image": {
                    "type": "path",
                    "data": "textures/ui/anvil_icon.png"
                }
            },
            {
                "text": "§b选择粘贴",
                "image": {
                    "type": "path",
                    "data": "textures/ui/copy.png"
                }
            },
            {
                "text": "§b移除建筑",
                "image": {
                    "type": "path",
                    "data": "textures/ui/book_trash_default.png"
                }
            },
            {
                "text": "§b修改选项",
                "image": {
                    "type": "path",
                    "data": "textures/ui/dev_glyph.png"
                }
            },
            {
                "text": "§c退出脚本",
                "image": {
                    "type": "path",
                    "data": "textures/ui/crossout.png"
                }
            }
        ]
    }`;
    addForm(menu, function (index) {
        switch (index) {
            case 0:
                CLICK_COPY = true;
                POS_DATA.x = 0;
                POS_DATA.y = 0;
                POS_DATA.z = 0;
                clientMessage('§b两点复制 ' + bool2str(CLICK_COPY));
                break
            case 1:
                showPosMenu();
                break
            case 2:
                showListMenu();
                break
            case 3:
                showRemoveListMenu();
                break
            case 4:
                showSettingMenu();
                break
            case 5:
                clientMessage('§b[建筑工具] §e脚本已关闭');
                exit();
                break
        }
    })
}

function onPlayerBuildBlockEvent(playerId, x, y, z, side) {
    if (CLICK_COPY) {
        if (POS_DATA.x === 0 && POS_DATA.y === 0 && POS_DATA.z === 0) {
            POS_DATA.x = x;
            POS_DATA.y = y;
            POS_DATA.z = z;
            showTipMessage('§e已经选择起点，请选择终点')
        } else {
            const blocks = getChunkBlocks(POS_DATA.x, POS_DATA.y, POS_DATA.z, x, y, z);
            const date = new Date();
            const time = date.getTime().toString();
            addForm(`{"type":"custom_form","title":"输入保存名称","content":[{"type":"input","text":"名称:","default":"${time}"}]}`, function (name) {
                if (typeof name == 'string' && name.length > 0) {
                    saveBlocksData(name, blocks);
                    clientMessage('§e保存成功');
                } else {
                    clientMessage('§c未保存');
                }
            }, function () {
                clientMessage('§c未选择保存');
            });
            POS_DATA.x = 0;
            POS_DATA.y = 0;
            POS_DATA.z = 0;
            CLICK_COPY = false
        }
        return false;
    }
    if (BUILD_TASKS.length === 0) {
        POS_DATA.x = x;
        POS_DATA.y = y;
        POS_DATA.z = z;
    }
    showMainMenu();
}

function onTickEvent() {
    if (BUILD_TASKS.length === 0) {
        return;
    }

    const maxTasks = Math.min(BUILD_TASKS.length, BUILD_TASKS_SPEED);

    for (let i = 0; i < maxTasks; i++) {
        const task = BUILD_TASKS.shift(); // 从队列头部取出任务

        if (typeof task === 'object') {
            const { x, y, z, name, aux } = task;
            const { x: baseX, y: baseY, z: baseZ } = POS_DATA;
            const command = `setblock ${baseX + x} ${baseY + y} ${baseZ + z} ${name} ${aux}`;
            executeCommand(command);
        } else {
            break;
        }
    }

    showTipMessage(`§e当前任务剩余: ${BUILD_TASKS.length}`);
}


function onCommandOutputEvent(type, args, value) {
    return BUILD_TASKS.length > 0;
}

clientMessage('§b[建筑工具] §e加载完成，请点击地面打开菜单');
