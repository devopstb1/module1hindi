(function($) {

    $.fn.swipe = function(settings) {

        var lastX = 0;
        var lastY = 0;
        var config = {
            left: function(e) {
            },
            right: function(e) {
            },
            preventDefault: false

        };

        if (settings)
            $.extend(config, settings);

        this.each(function() {

            var startX;
            var currentX;
            var startTime = false;
            var isMoving = false;

            function onTouchStart(e) {
                if (!isMoving) {

                    if (config.preventDefault) {

                        //		e.preventDefault(); 

                    }

                    startTime = new Date().getTime();

                    startX = e.pageX || e.touches[0].pageX;
                    currentX = startX;
                    lastX = startX;
                    lastY = e.pageX || e.touches[0].pageY;
                    isMoving = true;
                    //for ie 10 and other versions
                    if (window.navigator.msPointerEnabled) {
                        this.addEventListener("MSPointerMove", onTouchMove, false);
                    }
                    else if (window.navigator.pointerEnabled)
                    {
                        this.addEventListener("pointermove", onTouchMove, false);

                    }
                    else
                    {

                        this.addEventListener("mousemove", onTouchMove, false);
                    }
                    this.addEventListener('touchmove', onTouchMove, false);

                }

            }

            function onTouchMove(e) {

                if (config.preventDefault) {


                }
                /*Android fix - for swiping*/
                if (navigator.userAgent.toLowerCase().indexOf("android") > -1)
                {
//	alert("calling hammer 2 ges - ");
                    var currX = e.pageX || e.touches[0].pageX;
                    var currY = e.pageX || e.touches[0].pageY;
                    var diffX = 0;
                    var diffY = 0;

                    /*		if(currY > lastY)
                     {
                     diffY = currY-lastY;
                     }else{
                     diffY = lastY-currY;
                     }
                     */
                    diffY = Math.abs(lastY - currY);

                    /*		if(currX > lastX)
                     {
                     diffX = currX-lastX;
                     }else{
                     diffX = lastX-currX;
                     }
                     */
                    diffX = Math.abs(lastX - currX);

                    if (diffY < diffX)
                    {
                        // This is a swipe not a scroll....
                        e.preventDefault();
                    }
                }


                if (isMoving) {

                    currentX = e.pageX || e.touches[0].pageX;

                }

            }

            function onTouchEnd() {

//	alert("at end");
                if (window.navigator.msPointerEnabled) {
                    this.removeEventListener("MSPointerMove", onTouchMove);
                }
                else if (window.navigator.pointerEnabled)
                {
                    this.removeEventListener("pointermove", onTouchMove);
                }
                else
                {
                    this.removeEventListener("mousemove", onTouchMove);
                }
                this.removeEventListener('touchmove', onTouchMove);


                var endTime = new Date().getTime();
                var time = endTime - startTime;

                var endX = currentX;
                var distanceX = endX - startX;

                if (Math.abs(distanceX) > 75 && time < 600) {

                    if (distanceX < 0) {
                        if (window.navigator.msPointerEnabled) {
                            this.removeEventListener("MSPointerDown", onTouchStart);
                        }
                        else if (window.navigator.pointerEnabled)
                        {
                            this.removeEventListener("pointerdown", onTouchStart);
                        }
                        else
                        {
                            this.removeEventListener("mousedown", onTouchStart);
                        }
                        this.removeEventListener('touchstart', onTouchStart);

                        config.left(e);

                    }

                    else {
                        if (window.navigator.msPointerEnabled) {
                            this.removeEventListener("MSPointerDown", onTouchStart);
                        }
                        else if (window.navigator.pointerEnabled)
                        {
                            this.removeEventListener("pointerdown", onTouchStart);
                        }
                        else
                        {
                            this.removeEventListener("mousedown", onTouchStart);
                        }
                        this.removeEventListener('touchstart', onTouchStart);

                        config.right(e);

                    }

                    reset();

                }

                else {

                    reset();
                }
            }

            function reset() {

                startX = null;
                currentX = null;
                startDate = false;
                isMoving = false;

            }
            if (window.navigator.msPointerEnabled) {
                this.addEventListener("MSPointerDown", onTouchStart, false);
                this.addEventListener("MSPointerUp", onTouchEnd, false);
            }
            else if (window.navigator.pointerEnabled)
            {
                this.addEventListener("pointerdown", onTouchStart, false);
                this.addEventListener("pointerup", onTouchEnd, false);
            }
            else
            {
                this.addEventListener("mousedown", onTouchStart, false);
                this.addEventListener("mouseup", onTouchEnd, false);
            }
            this.addEventListener('touchstart', onTouchStart, false);
            this.addEventListener('touchend', onTouchEnd, false);

        });

        return this;

    };

})(jQuery);

