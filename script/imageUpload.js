var ImageUpload = {} || ImageUpload;
(function(namespace, undefined){
  namespace.constructParams = function(browseButton, container, callBack){
    var params = {
      "runtimes": 'html5,html4',
      "max_file_size": "6mb",
      "uptoken_url": "/codeiu/FUToken",
      dragdrop: false,
      chunk_size: '4mb',
      unique_names: true,
      domain: 'http://og4j2atko.bkt.clouddn.com',
      auto_start: false,
      "filters": {
        mime_types: [
          {title : "Image files", extensions : "jpg,png"}
        ]
      },
      init: {}
    };
    params["browse_button"] = browseButton;
    params["container"] = container;
    for(var funName in callBack){
      params.init[funName] = callBack[funName];
    }
    return params;
  };
  namespace.init = function(params){
    upload = Qiniu.uploader(params);
    $('#up_load').on('click', function(){
      upload.start();
    });

  }
}(ImageUpload));