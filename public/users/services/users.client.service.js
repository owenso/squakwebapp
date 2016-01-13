angular.module('users').factory('UserService', ['$http','$cookies','$location', '$rootScope', '$window', function($http,$cookies,$location,$rootScope, $window) {
    var userFac = {};

    userFac.newUser = {};
    userFac.getUserById = function(userID) {
        return $http.get('/api/v1/users/' + userID);
    };

    userFac.logOut = function() {
        $cookies.remove("currentId");
        delete $rootScope.authenticated;
        $http
            .get('/signout')
            .success(function(data, status, headers, config) {
                console.log('this ran');
            });
    };

    userFac.logIn = function(userObject) {
        $http
            .post('/api/v1/signin', userObject)
            .success(function(data, status, headers, config) {
                $rootScope.authenticated = true;
                if(data.knownLang === undefined || data.learnLang === undefined){
                    $cookies.put('currentId',data._id);
                    $rootScope.authenticated = true;
                    $location.path('/signup2');
                } else {
                    $rootScope.authenticated = true;
                    $window.location.href="/main/";
                }
            })
            .error(function(data, status, headers, config) {
                $cookies.remove('currentId');
                if(data == 'Unauthorized'){
                    $rootScope.message = 'Incorrect Username or Password.';
                }else{
                    $rootScope.message = data;
                }
            });
    };

    userFac.signUpOne = function(userData){
        $http
            .post('/api/v1/signup', userData)
            .success(function(data, status, headers, config) {
                $cookies.put('currentId',data._id);
                $location.path("/signup2");
                $rootScope.authenticated = true;
            })
            .error(function(data, status, headers, config) {
                $cookies.remove('currentId');
                $rootScope.message = data;
            });
    };

    userFac.signUpTwo = function(knownLang){

            $rootScope.knownLang = knownLang;

            $http
                .put('api/v1/users/' + $cookies.get('currentId'), {'knownLang':[knownLang]})
                .success(function(data, status, headers, config){
                    $location.path('/signup3');
                })
                .error(function(data, status, headers, config) {
                    console.log(data);
                });
        };

    userFac.signUpThree = function(learnLang){
        $http
            .put('api/v1/users/' + $cookies.get('currentId'), {'learnLang':[learnLang]})
            .success(function(data, status, headers, config){
                $cookies.remove("currentId");
                $window.location.href="/main/";
            })
            .error(function(data, status, headers, config) {
                console.log(data);
            });
    };
    return userFac;
}]);
