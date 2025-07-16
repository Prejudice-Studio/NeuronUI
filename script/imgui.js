
 // 定义数据对象
let settings = {
    showDemo: false,
    volume: 0.75,
    username: "Alice",
    index: 0,
};

function onImGuiRenderEvent() {
    ImGui.Begin("控制面板");

    // 显示 demo 窗口切换
    if (ImGui.Checkbox("显示 Demo 窗口", settings, "showDemo")) {
        console.log("是否显示 Demo:", settings.showDemo);
    }

    // 用户名输入框
    ImGui.InputText("用户名", settings, "username");

    // 音量滑块
    ImGui.SliderFloat("音量", settings, "volume", 0.0, 1.0);
    ImGui.SliderInt("Integer Slider", settings, "value", 0, 100);

    if (ImGui.Button("Click Me")) {
        console.log("Clicked!");
    }

    // Color Picker
    ImGui.ColorEdit3("Color", settings, ["r", "g", "b"]);

    let items = ["Item 1", "Item 2", "Item 3"];
    ImGui.Combo("Options", settings, items, "index");


     // 让下一个控件与前一个控件在同一行显示
    ImGui.Button("Button 1");
    ImGui.SameLine();
    ImGui.Button("Button 2");
    if (ImGui.Button("Button 3")) {
        console.log(`Button 3 clicked! ${settings}`,settings);
    }

    if (ImGui.BeginTabBar("MyTabs")) {
        if (ImGui.BeginTabItem("Tab A")) {
            ImGui.Text("This is Tab A");
            ImGui.EndTabItem();
        }
        if (ImGui.BeginTabItem("Tab B")) {
            ImGui.Text("This is Tab B");
            ImGui.EndTabItem();
        }
        ImGui.EndTabBar();
    }
    ImGui.End();

    // 可选显示 ImGui 自带的 demo 窗口
    if (settings.showDemo) {
        ImGui.ShowDemoWindow();
    }
}