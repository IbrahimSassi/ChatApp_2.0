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

    .controller('ChatController',function ($scope,$state,$stateParams) {

        $scope.nickname = $stateParams.nickname;

        $scope.sendMessage = function () {


        }
    })
