import mod.client.extraClientApi as clientApi
comp = clientApi.GetEngineCompFactory().CreateGame(levelId)
fps = comp.GetFps()
CF = clientApi.GetEngineCompFactory()
LVID = clientApi.GetLevelId()
Msg = CF.CreateTextNotifyClient(LVID).SetLeftCornerNotify