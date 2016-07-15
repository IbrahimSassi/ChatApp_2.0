angular.module('chatApp.controllers', [])


    .controller('LoginController',function ($scope,$state) {

        $scope.join = function (nickname) {

            if(nickname){
                $state.go('chat',{
                    nickname: nickname
                });
            }
        }
    })

    .controller('ChatController',function ($scope,$state,$stateParams,Socket) {
        $scope.nickname = $stateParams.nickname;
        $scope.messages=[];

        var COLORS = ['#f44336','#E91E63','#9C27B0','#3F51B5','#009688'];


        Socket.on("connect", function () {
            $scope.socketId = this.id;

            var data = {
                message: $scope.nickname + " has Joined the chat !",
                sender :$scope.nickname,
                socketId :$scope.socketId,
                isLog:true,
                color : $scope.getUsernameColor($scope.nickname)
            };

            Socket.emit("Message",data);
        });
        
        Socket.on("MessageReceived", function (dataFromServer) {
            $scope.messages.push(dataFromServer)
        })


        $scope.sendMessage = function () {
            var newMessage = {
              sender :  '',
                message :'',
                socketId : '',
                isLog: false,
                color : ''
            };

            newMessage.sender= $scope.nickname;
            newMessage.message = $scope.message;
            newMessage.socketId =$scope.socketId;
            newMessage.isLog = false;
            newMessage.color = $scope.getUsernameColor($scope.nickname);
            Socket.emit("Message", newMessage);
            $scope.message = "";

        }


        $scope.getUsernameColor = function(username){
            var hash = 7;

            for(var i = 0; i<username.length;i++){
                hash = username.charCodeAt(i) + (hash<<5) - hash;
            }
            var index = Math.abs(hash%COLORS.length);
            return COLORS[index]
        }



    })
