/**
 * @author: WhiteWallTeam
 * @date: 2024.10.12
 * @description: 新触控控制脚本
 */

function onCallModuleEvent(args) {
    const { fun, value, mode } = args;

    if (fun === 'script_new_touch_control') {
        setBooleanOption(13, { value });

        if (value && mode !== undefined) {
            const modeMapping = { 'touch': 1, 'crosshair': 2, 'classic': 3 };
            setEnumOption(4, { currentValue: modeMapping[mode] });
        }

        if (isInGame()) {
            clientMessage('§e需要进入设置后返回才能生效');
        }
    }
}