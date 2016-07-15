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

    .controller('ChatController',function ($scope,$state,$stateParams,Socket,$ionicScrollDelegate,$sce) {
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

            dataFromServer.message = fillWithEmoticons(dataFromServer.message);
            dataFromServer.message = $sce.trustAsHtml(dataFromServer.message);

            $scope.messages.push(dataFromServer);

            //auto Scroling
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);

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


         function fillWithEmoticons(message){
             //:p
             message = message.replace(/\(y\)/g, "<img src='../img/emoticons/32 (2).png' width='25px' height='25px' />");
             message = message.replace(/\:p/g, "<img src='../img/emoticons/32 (13).png' width='25px' height='25px' />");
             message = message.replace(/\;\)/g, "<img src='../img/emoticons/32 (17).png' width='25px' height='25px' />");
             message = message.replace(/\:D/g, "<img src='../img/emoticons/32 (20).png' width='25px' height='25px' />");
             message = message.replace(/\:\)/g, "<img src='../img/emoticons/32 (36).png' width='25px' height='25px' />");
             message = message.replace(/\:\(/g, "<img src='../img/emoticons/32 (11).png' width='25px' height='25px' />");
             message = message.replace(/\♥/g, "<img src='../img/emoticons/32 (37).png' width='25px' height='25px' />");
             return message;
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
