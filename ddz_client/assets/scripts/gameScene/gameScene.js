import myglobal from "../../mygolbal.js"

cc.Class({
    extends: cc.Component,

    properties: {
        di_label:cc.Label,
        beishu_label:cc.Label,
        roomid_label:cc.Label,
        player_node_prefabs:cc.Prefab,
        //绑定玩家座位,下面有3个子节点
        players_seat_pos:cc.Node,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.playerNodeList = []
        this.di_label.string = "底:" +  myglobal.playerData.bottom
        this.beishu_label.string = "倍数:" + myglobal.playerData.rate

        myglobal.socket.request_enter_room({},function(err,result){
            console.log("enter_room_resp"+ JSON.stringify(result))
            if(err!=0){
               console.log("enter_room_resp err:"+err)
            }else{
              //enter_room成功
              //notify ={"seatid":1,"playerdata":[{"accountid":"2117836","nick_name":"tiny543","avatarUrl":"http://xxx","goldcount":1000}]}
                var seatid = result.seatindex //自己在房间里的seatid
                this.playerdata_list_pos = []  //创建一个空用户列表
                this.setPlayerSeatPos(seatid)

                var playerdata_list = result.playerdata
                var roomid = result.roomid
                this.roomid_label.string = "房间号:" + roomid
                for(var i=0;i<playerdata_list.length;i++){
                    //console.log("this----"+this)
                    this.addPlayerNode(playerdata_list[i])
                }
            }
        }.bind(this))

        //在进入房间后，注册其他玩家进入房间的事件
        myglobal.socket.onPlayerJoinRoom(function(join_playerdata){
            //回调的函数参数是进入房间用户消息
            console.log("onPlayerJoinRoom:"+JSON.stringify(join_playerdata))
            this.addPlayerNode(join_playerdata)
        }.bind(this))
        
        //回调参数是发送准备消息的accountid
        myglobal.socket.onPlayerReady(function(data){
            console.log("-------onPlayerReady:"+data)
            for(var i=0;i<this.playerNodeList.length;i++){
                var node = this.playerNodeList[i]
                if(node){
                    node.emit("player_ready_notify",data)
                }
            }
        }.bind(this))
    },

    //seat_index自己在房间的位置id
    setPlayerSeatPos(seat_index){
        if(seat_index < 1 || seat_index > 3){
            console.log("seat_index error"+seat_index)
            return
        }

        console.log("setPlayerSeatPos seat_index:" + seat_index)
        var children = this.players_seat_pos.children;
        //界面位置转化成逻辑位置
        switch(seat_index){
            case 1:
                   this.playerdata_list_pos[1] = 0
                   this.playerdata_list_pos[2] = 1 
                   this.playerdata_list_pos[3] = 2
              break
             case 2:
                   

                    this.playerdata_list_pos[2] = 0
                    this.playerdata_list_pos[3] = 1
                    this.playerdata_list_pos[1] = 2
                    break
             case 3:
                    this.playerdata_list_pos[3] = 0     
                    this.playerdata_list_pos[1] = 1
                    this.playerdata_list_pos[2] = 2
                    break
            default: 
              break      
        } 

    },

    addPlayerNode(player_data){
        var playernode_inst = cc.instantiate(this.player_node_prefabs)
        playernode_inst.parent = this.node
        //创建的节点存储在gamescene的列表中
        this.playerNodeList.push(playernode_inst)

        var index = this.playerdata_list_pos[player_data.seatindex]
        console.log("index "+player_data.seatindex+ " "+index)
        playernode_inst.position = this.players_seat_pos.children[index].position
        playernode_inst.getComponent("player_node").init_data(player_data)
    },

    start () {
    },

    // update (dt) {},
});