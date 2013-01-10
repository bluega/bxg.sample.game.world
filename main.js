////////////////////////////////////////////////////////////////////////////////
// Sample - Isometric tilemap
/*
	Objectives:
		Loading level data
		Using Tilemap modules
*/
"Copyright ⓒ 2009-2013 BLUEGA Inc.";
"This sample game source is licensed under the MIT license."

////////////////////////////////////////////////////////////////////////////////
// Object manager for Isometric tilemap walking

IWalkingObjectjManager = {
	onActivate: function(/*Object*/obj, /*Number*/tickId)
	{
		bxg.WalkerTileMap.set(obj, {speed:9, tiles:obj.data.tiles, /*dir:0, player:true, noObstacle:true*/});
		obj.show();
	}
	,onTick: function(/*Object*/obj, /*Number*/tickId)
	{
		if (!obj.data.pattern) return;

		if (!bxg.WalkerTileMap.isMoving(obj)){
			if (obj.data.__$dir !== undefined){
				obj.data.dir = obj.data.__$dir;
				
				bxg.WalkerTileMap.move(obj, obj.data, true);
			
				if (!bxg.WalkerTileMap.canMove(obj)){
					obj.data.__$dir = undefined;
					obj.data.dir = undefined;
				}
			}
			
			if (obj.data.__$dir === undefined){
				obj.data.__$ptn = Math.floor(Math.random()*obj.data.pattern.length);
				obj.data.__$dir = obj.data.pattern[obj.data.__$ptn].dir;;
			}
			
			if (obj.data.__$dir !== undefined){
				obj.data.dir = obj.data.__$dir;

				if (obj.getCurSpriteState() != obj.data.pattern[obj.data.__$ptn].state){
					obj.setCurSpriteState(obj.data.pattern[obj.data.__$ptn].state);
				}
			}
		}
		bxg.WalkerTileMap.move(obj, obj.data);
		
	}
	,onWalkerEnd:function(/*Object*/obj, /*Number*/tickId)
	{
		obj.data.dir = null;
	}
}

////////////////////////////////////////////////////////////////////////////////
// Control manager for scrolling

IScrollManager = {
	onSysEvent: function(/*CControl*/control, /*Object*/event)
	{
		control.data.dragPos = control.data.dragPos || {};

		// Drag map by pointer device dragging
		switch(event.type){
		case bxg.EVENT_POINTER_START:
			// Process event only occured in playGround area
			if (!event.playGround) return;
		
			control.data.dragPos.x = event.scrX;
			control.data.dragPos.y = event.scrY;
			control.data.dragStart = true;
			break;
		case bxg.EVENT_POINTER_END:
			control.data.dragStart = false;
			break;
		case bxg.EVENT_POINTER_MOVE:
			if (control.data.dragStart){
				control.scroll(event.scrX-control.data.dragPos.x, event.scrY-control.data.dragPos.y);
				control.data.dragPos.x = event.scrX;
				control.data.dragPos.y = event.scrY;
			}
			break;
		}
	}
	,onReset: function(/*CControl*/control)
	{
		// Scroll map to the center position of view
		// This needs to be done before CLevelMap.load(). Because CLevelMap try to activate the map from the current scroll area.
		control.scroll(-parseInt((control.scrollSize.w - control.area.w)/2), -parseInt((control.scrollSize.h - control.area.h)/2));
		
		// Load level map
		control.level.load();
		
		// Init internal data
		control.data.dragStart = false;
	}
}

////////////////////////////////////////////////////////////////////////////////
// Game core

bxg.onGame = function()
{
	// Configurations
	//  - get 'type' by URL parameter
	bxg.c.type = bx.$getParamFromURL(location.href, 'type') || '4';
	bxg.c.tick = 60; 			//msec
	bxg.c.scrSize = {w:760, h:400};
	
	// Initialize BXG engine, aligning in page center
	bxg.init({x:0, y:0, w:bxg.c.scrSize.w, h:bxg.c.scrSize.h}, {renderer:'canvas', align:{x:'center', y:'center'}});
	
	// Turn on waiting-box for game loading
	bx.UX.waitBox(true, "Loading...");
	
	bxg.g.objs = [
		{
			type:'obj.fountain'
			,imagePath:'imgs/obj.fountain'
			,images:{
				fountain:{url:'fountain_128x137.png', sprite:{size:{w:128, h:137}, cols:3, count:3}}
			}
			,info:{
				normal:{sprite:['fountain1', 'fountain2', 'fountain3']}
			}
			,options:{
				sprite:{speed:5}
			}
		}
		,{
			type:'obj.man'
			,imagePath:'imgs/obj.man'
			,images:{
				man:{url:'man_16x29.png', sprite:{size:{w:16, h:29}, cols:24, count:24}}
			}
			,info:{
				right:{sprite:['man1', 'man2', 'man3', 'man4', 'man5', 'man6']},
				left:{sprite:['man7', 'man8', 'man9', 'man10', 'man11', 'man12']},
				down:{sprite:['man13', 'man14', 'man15', 'man16', 'man17', 'man18']},
				up:{sprite:['man19', 'man20', 'man21', 'man22', 'man23', 'man24']}
			}
			,config:{
				pattern:[{dir:1, state:'left'}, {dir:3, state:'left'},{dir:5, state:'right'}, {dir:7, state:'right'}]
				,tiles:{
					on:{road:true}
				}
			}
			,options:{
				manager:IWalkingObjectjManager
			}
		}
		,{
			type:'obj.girl'
			,imagePath:'imgs/obj.girl'
			,images:{
				girl:{url:'girl_16x23.png', sprite:{size:{w:16, h:23}, cols:24, count:24}}
			}
			,info:{
				right:{sprite:['girl1', 'girl2', 'girl3', 'girl4', 'girl5', 'girl6']},
				left:{sprite:['girl7', 'girl8', 'girl9', 'girl10', 'girl11', 'girl12']},
				down:{sprite:['girl13', 'girl14', 'girl15', 'girl16', 'girl17', 'girl18']},
				up:{sprite:['girl19', 'girl20', 'girl21', 'girl22', 'girl23', 'girl24']}
			}
			,config:{
				pattern:[{dir:0, state:'up'}, {dir:1, state:'left'}, {dir:2, state:'left'}, {dir:3, state:'left'}, {dir:4, state:'down'}, {dir:5, state:'right'}, {dir:6, state:'right'}, {dir:7, state:'right'}]
				,tiles:{
					on:{coast:true, meadow:true}
				}
			}
			,options:{
				manager:IWalkingObjectjManager
			}
		}
	];
	
	var objIdList = [];
	
	// Register object templates to the object factory
	for(var obj = 0; obj < bxg.g.objs.length; obj ++){
		bxg.ObjectFactory.register(bxg.g.objs[obj]);
		
		objIdList.push(bxg.g.objs[obj].type);
	}

	// Load image resource of ObjectFactory-managed game objects
	bxg.ObjectFactory.load(objIdList, onLoadObjects);
}

function onLoadObjects(/*Number*/loaded, /*Number*/failed)
{
	// Setup scrollable game control by give type.
	// 'size' options is not important here, the control map area size will be set after loading level data.
	switch(bxg.c.type){
	case '4B': // 4Way buffered scroll, so large map area.
		bxg.c.idLevel = 'lvl.bxg.sample.world.1';
		bxg.g.cntlWorld = new bxg.CBufferedScrollControl(IScrollManager, {size:bxg.c.scrSize}).create();
		break;
	default: // 4Way scroll, non-buffered scroll, so 4x size of map area.
		bxg.c.idLevel = 'lvl.bxg.sample.world.1';
		bxg.g.cntlWorld = new bxg.CScrollControl(IScrollManager, {size:bxg.c.scrSize}).create();
		break;
	}
	
	bxg.g.tileLayerWorld = new bxg.CTileMapLevel();
	bxg.g.tileLayerWorld.createFromFile(bxg.g.cntlWorld, {idLevel:bxg.c.idLevel, idControl:'world', onResult:onReady});
}

function onReady(/*Boolean*/succ)
{	
	if (!succ) return;

	// Turn off waiting-box
	bx.UX.waitBox(false);
	
	// Game start
	bxg.game.init({tick:bxg.c.tick});
	bxg.game.addControl(bxg.g.cntlWorld);
	bxg.game.run();
	
	bxg.Inspector.createConsole({consolePerformanceFull:true, consoleObjectFactory:true, consoleRenderer:true});
}
