import mod.client.extraClientApi as clientApi
# 使玩家向左前方移动
localPlayerId = clientApi.GetLocalPlayerId()
rotComp = clientApi.GetEngineCompFactory().CreateRot(localPlayerId)
motionComp = clientApi.GetEngineCompFactory().CreateActorMotion(localPlayerId)
motionComp.LockInputVector((0, 5))
# 使玩家跳跃
comp = clientApi.GetEngineCompFactory().CreateActorMotion(localPlayerId)
comp.LockVerticalMove(True)
# 高丸粒子
comp = clientApi.GetEngineCompFactory().CreateParticleSystem(None)
localId = clientApi.GetLocalPlayerId()

parId = comp.Create("netease:tutorial_particle")
comp.BindEntity(parId, localId, "body", (0, 0, 0), (0, 0, 0))