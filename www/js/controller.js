angular.module('chatApp.controllers', [])


    .controller('LoginController', function ($scope,
                                             $state,
                                             $cordovaOauth,
                                             $http) {

        $scope.join = function (nickname) {

            if (nickname) {
                $state.go('chat', {data : {
                    nickname: nickname,
                    displayPicture : 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/a9475211889067.562541caf0859.png'
                }});
            }
        }


        //LoginWithFacebook

        $scope.user = {};
        $scope.LoginWithFacebook = function () {
            $cordovaOauth.facebook("App Id", ["email"]).then(function (result) {
                // results
                console.log(result);
                $http.get('https://graph.facebook.com/v2.7/me?field=id,name,picture&access_token=' + result.access_token)
                    .success(function (data, status, header, config) {
                        $scope.user.fullName = data.name;
                        $scope.user.displayPicture = data.picture.data.url;
                       // alert($scope.user.fullName + " " + $scope.user.displayPicture);
                        $state.go('chat',{data :{nickname:$scope.user.fullName,
                                        displayPicture:$scope.user.displayPicture}});
                    })
            }, function (error) {
                console.log(error);
            });
        }


    })


    .controller('ChatController', function ($scope, $state,
                                            $stateParams, Socket,
                                            $ionicScrollDelegate,
                                            $sce,
                                            $timeout,
                                            $cordovaMedia) {


        $scope.status_message = "Welcome To ChatApp";
        $scope.nickname = $stateParams.data.nickname;
        $scope.messages = [];
        $scope.displayPicture = $stateParams.data.displayPicture;

        var COLORS = ['#f44336', '#E91E63', '#9C27B0', '#3F51B5', '#009688'];


        Socket.on("connect", function () {
            $scope.socketId = this.id;

            var data = {
                message: $scope.nickname + " has Joined the chat !",
                sender: $scope.nickname,
                socketId: $scope.socketId,
                isLog: true,
                displayPicture: '',
                color: $scope.getUsernameColor($scope.nickname)
            };

            Socket.emit("Message", data);
        });

        Socket.on("MessageReceived", function (dataFromServer) {

            dataFromServer.message = fillWithEmoticons(dataFromServer.message);
            dataFromServer.message = $sce.trustAsHtml(dataFromServer.message);

            $scope.messages.push(dataFromServer);
            if ($scope.socketId == dataFromServer.socketId) {
                playAudio("audio/outgoing.mp3");
            }
            else {
                playAudio("audio/outgoing.mp3");
            }

            //auto Scroling
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);

        })


        var typing = false;
        var TYPING_TIMER_LENGTH = 3000;


        //Typing Fon

        $scope.updateTyping = function () {
            if (!typing) {
                typing = true;
                Socket.emit("typing", {
                    socketId: $scope.socketId,
                    sender: $scope.nickname
                });

            }

            var lastTypingTime = (new Date()).getTime();

            $timeout(function () {
                var timeDiff = (new Date()).getTime() - lastTypingTime;

                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    Socket.emit('StopTyping', {
                        socketId: $scope.socketId,
                        sender: $scope.nickname
                    });
                    typing = false;
                }

            }, TYPING_TIMER_LENGTH);
        }


        Socket.on('StopTyping', function (data) {
            $scope.status_message = "Welcome to Chat App";
        });

        Socket.on('typing', function (data) {
            $scope.status_message = data.sender + ' is typing';
        });


        function playAudio(src) {

            if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
                var newUrl = '';
                if (ionic.Platform.isAndroid()) {
                    newUrl = '/android_asset/www/' + src;
                }
                else {
                    newUrl = src;
                }

                var media = $cordovaMedia.newMedia(newUrl);
                media.play();
            }
            else {
                new Audio(src).play();
            }


        }


        $scope.sendMessage = function () {
            var newMessage = {
                sender: '',
                message: '',
                socketId: '',
                isLog: false,
                displayPicture: '',
                color: ''
            };

            newMessage.sender = $scope.nickname;
            newMessage.message = $scope.message;
            newMessage.socketId = $scope.socketId;
            newMessage.isLog = false;
            newMessage.displayPicture = $scope.displayPicture;
            newMessage.color = $scope.getUsernameColor($scope.nickname);
            Socket.emit("Message", newMessage);
            $scope.message = "";

        }


        function fillWithEmoticons(message) {
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


        $scope.getUsernameColor = function (username) {
            var hash = 7;

            for (var i = 0; i < username.length; i++) {
                hash = username.charCodeAt(i) + (hash << 5) - hash;
            }
            var index = Math.abs(hash % COLORS.length);
            return COLORS[index]
        }


    })
