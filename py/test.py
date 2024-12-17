# -*- coding: utf-8 -*-

import mod.server.extraServerApi as serverApi
import mod.client.extraClientApi as clientApi

levelId = serverApi.GetLevelId()

entityId = clientApi.GetLocalPlayerId()

comp = clientApi.GetEngineCompFactory().CreatePlayer(entityId)

comp.setSneaking()
