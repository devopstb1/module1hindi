(function($){
    var iCountMultiAnimatedElements = 0;
    var aniTimeOut;//added by Nehal for Accion
    
    $.fn.animationOnElement = function  (sClassToRemove, sAnimationName, fCallback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.removeClass(sClassToRemove).addClass('animated ' + sAnimationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + sAnimationName);
            if(fCallback) {
                fCallback();
            }
            return;
        });
    };
    $.fn.animationOnMultiElements = function (aAnimation, fCallback) {
        if(aAnimation) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            aAnimation = Array.isArray(aAnimation) ? aAnimation : [aAnimation];
            if (aAnimation.length !== iCountMultiAnimatedElements) {
                var oAnim = aAnimation[iCountMultiAnimatedElements],
                    elem = oAnim._elem,
                    sAnimationName = oAnim._animationName,
                    nTimeDelay = (oAnim._timeDelay * 1000) || 0;
                    //changed by nehal for accion
                    aniTimeOut = setTimeout(function(){
                    $(elem).removeClass("hide").addClass('animated no-events ' + sAnimationName).one(animationEnd, function () {
                        $(this).removeClass('animated ' + sAnimationName);
                        iCountMultiAnimatedElements++;
                        $.animationOnMultiElements(aAnimation, fCallback);
                    });
                }, nTimeDelay);
            }
            else {
                for(var iKey in aAnimation){
                    var oAnim = aAnimation[iKey],
                        elem = oAnim._elem;
                    $(elem).removeClass("no-events");
                }
                iCountMultiAnimatedElements = 0;
                if(fCallback) {
                    fCallback();
                }
                return;
            }
        }
        
    };
    /// added by Nehal for Accion to terminate the animation when navigate to any page --else it hangs
    $.terminateAnimation = function(){
        clearTimeout(aniTimeOut);
        iCountMultiAnimatedElements = 0;
    }
    $.animationOnMultiElements = function (aAnimation, fCallback) {
        $.fn.animationOnMultiElements(aAnimation, fCallback);
    };

})(jQuery);