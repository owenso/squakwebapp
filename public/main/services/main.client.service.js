angular.module('main').factory('MainService', ['$http', '$cookies', '$location', '$rootScope', '$window','Upload', function($http, $cookies, $location, $rootScope, $window, Upload) {
    var mainFac = {};

    mainFac.newUser = {};

    mainFac.getUserById = function(userID) {
        return $http.get('/api/users/' + userID);
    };

    mainFac.getLoggedUser = function() {
        $http
            .get('../api/currentUserId')
            .success(function(data, status, headers, config) {
                $cookies.put('currentId', data);
                $rootScope.authenticated = true;
            });
    };

    mainFac.logOut = function() {
        $cookies.remove("currentId");
        delete $rootScope.authenticated;
        $http
            .get('/signout')
            .success(function(data, status, headers, config) {
                console.log($cookies.getAll());
                $window.location.href = "/";
            });
    };



    //recording
    mainFac.saveRecording = function(sourceBlob, messageObject) {

        var reader = new FileReader();
        var _this = this;

        reader.onloadend = function(e) {
            var convBlob = new Int16Array(e.target.result);
            var lib = new lamejs();
            var mp3Data = [];
            var mp3encoder = new lib.Mp3Encoder(1, 44100, 128); //mono 44.1khz encode to 128kbps
            var samples = convBlob;
            var mp3Tmp = mp3encoder.encodeBuffer(samples); //encode mp3

            //Push encode buffer to mp3Data variable
            mp3Data.push(mp3Tmp);
            // Get end part of mp3
            mp3Tmp = mp3encoder.flush();

            // Write last data to the output data, too
            // mp3Data contains now the complete mp3Data
            mp3Data.push(mp3Tmp);

            console.debug(mp3Data);
            var blob = new Blob(mp3Data, {
                type: 'audio/mp3'
            });
            var blobURL = URL.createObjectURL(blob);

            _this.blob = blob;
            _this.blobURL = blobURL;
        };
        reader.readAsArrayBuffer(sourceBlob);
    };

    mainFac.uploadToS3 = function(uploadedImage){
        var query = {
            filetype: uploadedImage.name.split('.').pop(),
            userId: $cookies.get('currentId'),
            type: uploadedImage.type
        };

        $http.post('/signing', query)
            .success(function(result) {
                Upload.upload({
                    url: result.url, //s3Url
                    //url:'/tracker',
                    transformRequest: function(data, headersGetter) {
                        var headers = headersGetter();
                        delete headers.Authorization;
                        return data;
                    },
                    // fields: result.fields, //credentials
                    data:result.fields,
                    method: 'POST',
                    headers:{'Content-Type':result.fields['Content-Type']},
                    file: uploadedImage
                }).progress(function(evt) {
                    console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                }).error(function() {

                });
            })
            .error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('ERROR:');
                console.log(headers);
                console.log(status);
                console.log(data);
            });

        };

    return mainFac;
}]);
