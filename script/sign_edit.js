
function onPlayerBuildBlockEvent(id,x,y,z,side) {
    setBlockEntityData(x,y,z,`{BackText:{HideGlowOutline:0b,IgnoreLighting:0b,PersistFormatting:1b,SignTextColor:-16777216,Text:"你好",TextOwner:""},FrontText:{HideGlowOutline:0b,IgnoreLighting:0b,PersistFormatting:1b,SignTextColor:-16777216,Text:"你好",TextOwner:""},IsWaxed:0b,LockedForEditingBy:-1l,id:"HangingSign",isMovable:1b,x:${x},y:${y},z:${z}}`)
    return true
}
