/*
 * The purpose of this Object is to Load and manage the User Interface
 */
define([
	'jquery',
	'framework/config/CourseConfigData',
	'framework/utils/ResourceLoader',
	'framework/utils/EventDispatcher',
 	], function($, CourseConfigData, ResourceLoader, EventDispatcher) {
	
	var __instancexAPIWrapper;
	
	function xAPIWrapper(){
		
		EventDispatcher.call(this);
		
		var oScope = this;
		this.tincan = null;
		this.loginTime = null;
		this.oTINCANConfig = {};		
		
		//this.loadTinCanConfigObj = this.loadTinCanConfigObj.bind(this);	
		this.createConfigObj = this.createConfigObj.bind(this);
		
	}
	
	xAPIWrapper.prototype = Object.create(EventDispatcher.prototype);
    xAPIWrapper.prototype.constructor = xAPIWrapper;
	
	
	xAPIWrapper.prototype.isAvailable = function(){
		return true;
	}
	
	xAPIWrapper.prototype.find = function(){
		var oScope = this;
		return oScope.tincan;
	}
	
	xAPIWrapper.prototype.get = function(){
		var oScope = this;
		return oScope.tincan;
	}
	
	xAPIWrapper.prototype.init = function(){
		var oScope = this;
		 try {
			oScope.tincan = new TinCan(
			   {
					url: oScope.oTINCANConfig.xAPI_url_initObj.url,
					activity: oScope.oTINCANConfig.xAPI_url_initObj.activity 
				}
			);
			return oScope.checkForXAPIInit();
		}catch (ex) {
			return false;
		}
	}
	
	xAPIWrapper.prototype.checkForXAPIInit = function(){
		var oScope = this;
		var result = oScope.getInitialised();
		if(result === false){
			result = oScope.setInitialised();
		}
		oScope.startTinCanTimer();
		return result;
	}
	
	xAPIWrapper.prototype.getInitialised = function(){
		var oScope = this;
		var result = oScope.tincan.getStatements({
			sendActor: true,
			params: {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/initialized"
				},
				activity: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName //Need change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription //Need change
						}
					}
				}
			}
		});
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return false;
	}
	
	
	xAPIWrapper.prototype.setInitialised = function(){
			var oScope = this;
			var result = oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/initialized",
					display: {
						"en-US": "initialized"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName// Need Change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription// Need Change
						}
					}
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return false;
	}
	
	
	xAPIWrapper.prototype.startTinCanTimer = function(){
		var oScope = this;
		oScope.loginTime = new Date().getTime();
	}
	
	xAPIWrapper.prototype.getTinCanTimeSpent = function(){
		var oScope = this;
		var date = new Date();
		var logoffTime = date.getTime();
		var timeDiff = logoffTime - oScope.loginTime;
		var time = TinCan.Utils.convertMillisecondsToISO8601Duration(timeDiff);
		return time;
	}
	
	
	xAPIWrapper.prototype.doLMSSetValue = function(name, value){
		var oScope = this;
		if(name == "suspend_data"){
			return oScope.setBookmarkData(value);
		}
		if(name == "completion"){
			return oScope.setCompletion(value);
		}
		if(name == "attempted"){
			return oScope.setAttempted();
		}
		if(name == "score"){
			return oScope.setScore(value);
		}
		if(name == "exit"){
			return oScope.setExit(value);
		}
		if(name == "passed"){
			return oScope.setPassed();
		}
		if(name == "failed"){
			return oScope.setFailed(value);
		}
	}
	
	
	xAPIWrapper.prototype.doLMSGetValue = function(name){
		var oScope = this;
		if(name == "suspend_data"){
			return oScope.getBookmarkData()
		}
		if(name == "completion"){
			return oScope.getCompletion()
		}
		if(name == "attempted"){
			return oScope.getAttempted()
		}
		if(name == "score"){
			return oScope.getScore()
		}
		if(name == "learnername"){
			return oScope.tincan.actor.name;
		}
		if(name == "passed"){
			return oScope.getPassed()
		}
	}
	
	
	
	xAPIWrapper.prototype.setBookmarkData = function(value){
		var oScope = this;
		var result = oScope.tincan.setState("bookmarking-data", value, {
			contentType: "text/plain",
			overwriteJSON: false
		});
		try{
			if(result.err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result;
	}
	
	
	xAPIWrapper.prototype.getBookmarkData = function(){
		var oScope = this;
		var stateResult = oScope.tincan.getState("bookmarking-data");
		if (stateResult.err === null && stateResult.state !== null && stateResult.state.contents !== "") {
			return stateResult.state.contents;
		}
		return null;
	}
	
	xAPIWrapper.prototype.setCompletion = function(value){
		var oScope = this;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result =  oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/completed",
					display: {
						"en-US": "completed"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName//need change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription//need change
						}
					}
				},result: {                  
					completion: value,
					duration: timeTaken
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result;
	}
	
	
	
	
	
	xAPIWrapper.prototype.getCompletion = function(){
		var oScope = this;
		var result = oScope.tincan.getStatement(	
		{
			verb: {
				id: "http://adlnet.gov/expapi/verbs/completed",
				display: {
					"en-US": "completed"
				}
			},
			object: {
				id: oScope.oTINCANConfig.ID,
				definition: {
					type: "http://adlnet.gov/expapi/activities/course",
					name: {
						"en-US": oScope.oTINCANConfig.courseName// need change
					},
					description: {
						"en-US": oScope.oTINCANConfig.courseDescription// need change
					}
				}
			}
		}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result
	}
	
	
	
	xAPIWrapper.prototype.setAttempted = function(){
		var oScope = this;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result = oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/attempted",
					display: {
						"en-US": "attempted"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName//need change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription//need change
						}
					}
				},result: {                  
					duration: timeTaken
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result;
	}
	
	
	xAPIWrapper.prototype.setScore = function(scoreVal){
		var oScope = this;
		var scaledScoreVal = scoreVal/100;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result = oScope.tincan.sendStatement(	
		{
			verb: {
				id: "http://adlnet.gov/expapi/verbs/scored",
				display: {
					"en-US": "scored"
				}
			},
			object: {
				id: oScope.oTINCANConfig.ID,
				definition: {
					type: "http://adlnet.gov/expapi/activities/course",
					name: {
						"en-US": oScope.oTINCANConfig.courseName// need change
					},
					description: {
						"en-US": oScope.oTINCANConfig.courseDescription// need change
					}
				}
			},result: {                  
				score: {
					scaled: scaledScoreVal,
					raw: scoreVal
				},
				duration: timeTaken
			}
		}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result
	}
	
	
	
	xAPIWrapper.prototype.getScore = function(){
		var oScope = this;
		var result = oScope.tincan.getStatement(	
		{
			verb: {
				id: "http://adlnet.gov/expapi/verbs/scored",
				display: {
					"en-US": "scored"
				}
			},
			object: {
				id: oScope.oTINCANConfig.ID,
				definition: {
					type: "http://adlnet.gov/expapi/activities/course",
					name: {
						"en-US": oScope.oTINCANConfig.courseName// need change
					},
					description: {
						"en-US": oScope.oTINCANConfig.courseDescription// need change
					}
				}
			}
		}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result
	}
	
	xAPIWrapper.prototype.getPassed = function(){
		var oScope = this;
		var result = oScope.tincan.getStatement(	
		{
			verb: {
				id: "http://adlnet.gov/expapi/verbs/passed",
				display: {
					"en-US": "passed"
				}
			},
			object: {
				id: oScope.oTINCANConfig.ID,
				definition: {
					type: "http://adlnet.gov/expapi/activities/course",
					name: {
						"en-US": oScope.oTINCANConfig.courseName// need change
					},
					description: {
						"en-US": oScope.oTINCANConfig.courseDescription// need change
					}
				}
			}
		}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result
	}
	
	
	xAPIWrapper.prototype.setPassed = function(){
		var oScope = this;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result =  oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/passed",
					display: {
						"en-US": "passed"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName//need change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription//need change
						}
					}
				},result: {                 
					duration: timeTaken
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result;
	}
	
	
	
	xAPIWrapper.prototype.setFailed = function(scoreVal){
		var oScope = this;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result =  oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/failed",
					display: {
						"en-US": "failed"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName//need change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription//need change
						}
					}
				},result: {                 
					duration: timeTaken
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result;
	}
	
	
	xAPIWrapper.prototype.setExit = function(){
		var oScope = this;
		var timeTaken = oScope.getTinCanTimeSpent();
		var result = oScope.tincan.sendStatement(	
			{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/suspended",
					display: {
						"en-US": "suspended"
					}
				},
				object: {
					id: oScope.oTINCANConfig.ID,
					definition: {
						type: "http://adlnet.gov/expapi/activities/course",
						name: {
							"en-US": oScope.oTINCANConfig.courseName//change
						},
						description: {
							"en-US": oScope.oTINCANConfig.courseDescription//change
						}
					}
				},result: {                  
					duration: timeTaken
				}
			}
		);
		try{
			if(result.results[0].err == null){
				return true
			}
		}catch(e){
			return false;
		}
		return result
	}
	
	
	
	xAPIWrapper.prototype.loadTinCanXMLObj = function(){
		var oScope = this;
		$.getScript("js/libs/tincan-min.js", function() {
			oScope.createConfigObj();
		});
		//oScope.loadTinCanConfigObj();
	};
	
	
	xAPIWrapper.prototype.createConfigObj = function() {
		var oScope = this,
			jSonObject = CourseConfigData.tincanSettings.items,
			localTinCanObj = {};

		for(i=0; i<jSonObject.item.length; i++){
			var key = jSonObject.item[i].type;
			localTinCanObj[key] = jSonObject.item[i].text;
		}
		
		oScope.oTINCANConfig.xAPImethod = localTinCanObj.xAPImethod;
		
		oScope.oTINCANConfig.ID = localTinCanObj.courseID;
		oScope.oTINCANConfig.courseName = localTinCanObj.courseName;
		oScope.oTINCANConfig.courseDescription = localTinCanObj.courseDescription;
		
		oScope.oTINCANConfig.minScore = localTinCanObj.minScore;
		oScope.oTINCANConfig.maxScore = localTinCanObj.maxScore;

		//EndPoint Object
		oScope.oTINCANConfig.xAPI_endPoint_initObj = {
			endpoint: localTinCanObj.endpointURL,
			username: localTinCanObj.endpointUserName,
			password: localTinCanObj.endpointPassword,
			allowFail: false
		}

		

		oScope.oTINCANConfig.getInitObj = function(){
			//console.log("[oTINCANConfig.getInitObj] : oTINCANConfig.xAPImethod : "+oTINCANConfig.xAPImethod);
			if(oScope.oTINCANConfig.xAPImethod == "endpoint"){
				return oScope.oTINCANConfig.xAPI_endPoint_initObj;
			}else{
				return oScope.oTINCANConfig.xAPI_url_initObj;
			}
		}

		oScope.oTINCANConfig.CourseActivity = {
			id: localTinCanObj.courseActivityID,
			definition: {
				type: "http://adlnet.gov/expapi/activities/course",
				name: {
					"en-US": localTinCanObj.courseName
				},
				description: {
					"en-US": localTinCanObj.courseDescription
				}
			}
		};
		
		//URL Object
		oScope.oTINCANConfig.xAPI_url_initObj = {
			url: window.location.href,
			activity: oScope.oTINCANConfig.CourseActivity
		}


		oScope.oTINCANConfig.verbObject = {
			initialized : {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/initialized"
				},
				result: {
					duration: "PT0S"
				}
			},
			attempted : {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/attempted"
				},
				result: {
					duration: "PT0S"
				}
			},
			resumed : {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/resumed"
				},
				result: {
					duration: "PT0S"
				}
			},
			suspended : {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/suspended"
				},
				result: {
					duration: "PT0S"
				}
			},
			terminated :{
				verb: {
					id: "http://adlnet.gov/expapi/verbs/terminated"
				},
				result: {
					duration: "PT0S"
				}
			},
			completed : {
				verb: {
					id: "http://adlnet.gov/expapi/verbs/completed"
				},
				object: {
					id: "activityId"
				},
				result: {
					score: {
						scaled: "scaledScore",
						raw: "score",
						min: parseInt(localTinCanObj.minScore),
						max: parseInt(localTinCanObj.maxScore)
					},                    
					completion: "success",
					duration: "duration"
				}
			}
		};
		var oEvent = {type: 'TINCANCONFIG_LOADED'};
		this.dispatchEvent('TINCANCONFIG_LOADED', oEvent);
	}
	
	xAPIWrapper.prototype.toString					= function(){
		return 'libs/xAPIWrapper';
	};

	if(!__instancexAPIWrapper){
		__instancexAPIWrapper = new xAPIWrapper();
	}

	return __instancexAPIWrapper;
});
