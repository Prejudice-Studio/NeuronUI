const getSuffix = (filename) => {
    var parts = filename.split(".");
    return parts[parts.length - 1];
}
const get_file_list = (path, Suffix) => {
    const list = file_list(path)
    const output = []
    for (const i in list) {
        if (getSuffix(list[i].name) === Suffix) {
            output.push(list[i])
        }
    }
    output.sort((a, b) => a.name.localeCompare(b.name));
    return output
}
const getSize = (path) => {
    const data = read_file(path)
    return data.length / 1024
}
const main_menu = () => {
    if (JS_list.length === 0) {
        clientMessage('§b[Neuron]§e读取脚本列表失败(可能是没有储存权限)');
        return;
    }
    var menu = {
        type: 'form',
        title: '§3共' + JS_list.length + '个脚本',
        content: '列表',
        buttons: [{
            text: '§9设置'
        }, {
            text: '§9上次加载: §e' + last_script
        }]
    };
    for (let i = 0; i < JS_list.length; i++) {
        const js = JS_list[i]
        const size = getSize(js.path)
        menu.buttons[i + 2] = {
            text: '§e' + js.name + '§r - §a' + size.toFixed(2) + 'kb',
            image: {
                type: "path",
                data: "textures/ui/storageIconColor.png"
            }
        }
    }
    addForm(JSON.stringify(menu), function(index) {
        if (index == 0) {
            settings();
        }
        if (index == 1) {
            load(last_script);
        }
        if (index >= 2) {
            const js_name = JS_list[index - 2].name
            load(js_name)
            clientMessage('§b[Neuron]§e加载脚本==> §b' + js_name)
            setData("script", js_name)
        }
    })
}
const settings = () => {
    const json = ` {
        "type": "custom_form",
        "title": "§a设置",
        "content": [{
            "type": "slider",
            "text": "加载延迟/S",
            "min": 1,
            "max": 10,
            "step": 1,
            "default": ` + config.delay + `
        }, {
            "type": "toggle",
            "text": "本地加载模式",
            "default": ` + b2s(config.mode === "eval") + `
        }, {
            "type": "toggle",
            "text": "强制退出",
            "default": ` + b2s(config.allowExit) + `
        }, {
            "type": "toggle",
            "text": "调试模式",
            "default": ` + b2s(config.debug) + `
        }]
    }`;
    addForm(json, function(delay, mode, e, debug) {
        config.delay = delay * 1000
        config.mode = (mode) ? 'eval' : 'load'
        config.allowExit = e
        config.debug = debug
        main_menu()
    })
}
const load = (script_name) => {
    const js_path = path + "/script/" + script_name;
    var js_text = read_file(js_path);

    thread(() => {
        if (config.mode === "eval") {
            var js = js_text + ((config.allowExit && js_text.indexOf("exit()") === -1) ? "\nfunction onSendChatMessageEvent(text) {if(text === \"退出\") {clientMessage('§b[Neuron]§e已退出'); exit(); return true;}}" : "");
            eval((config.debug) ? "try {\n" + js + "\n}catch(e){clientMessage('§b[Neuron]§e发现错误===> '+e.toString())};" : js);
        }
        if (config.mode === "load") {
            if (config.allowExit && js_text.indexOf("exit()") === -1) {
                write_file(js_path, js_text + "\nfunction onSendChatMessageEvent(text) {if(text === \"退出\") {clientMessage('§b[脚本菜单]§e已退出'); exit(); return true;}}");
                js_text = read_file(js_path);
            }
            if (config.debug && js_text.indexOf("try") === -1) {
                write_file(js_path, "try {\n" + js_text + "\n}catch(e){clientMessage('§b[Neuron]§e发现错误===> '+e.toString())};");
                js_text = read_file(js_path);
            }
            exit()
            loadScript(script_name);
        }
    }, config.delay);
};
const b2s = (bool) => {
    return (bool) ? 'true' : 'false'
}

const path = getResource()
const JS_list = get_file_list(path + "/script", "js")
const last_script = getData("script", "没有数据")

var config = {
    mode: "load",
    allowExit: false,
    delay: 0,
    debug: false
}

main_menu()