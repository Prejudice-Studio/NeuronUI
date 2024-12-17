/**
 * @author: WhiteWallTeam
 * @date: 2024.12.17
 * @description: Python脚本执行器
 */

const path = getResource() + "/py/test.py"

function onCallModuleEvent(args) {
    const { fun } = args;
    if (fun === "script_py_executor") {
        const result = execPython(path);
        if (result){
            clientMessage('Python脚本执行成功')
        } else {
            clientMessage('Python脚本执行失败')
        }
    }
}