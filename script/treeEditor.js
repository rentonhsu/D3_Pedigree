
		
		function familyTree(data, attributes){
				var width = $(attributes.container).attr('width');
				var height = $(attributes.container).attr('height');
				var self = this;
				this.data = data;
				this.radius = attributes.radius;
				this.width = width;
				this.height = height;
				this.offsetX = width/20;
				this.offsetY = height/5;

				this.lineGrp = attributes.linesGrp;
				this.nodeGrp = attributes.nodesGrp;

				this.scaleX = d3.scale.linear()
		                     .range([this.offsetX,this.width-this.offsetX])
		                     .domain([0,this.width]);
				this.scaleY = d3.scale.linear()
			                 .range([this.offsetY,this.height-this.offsetY])
			                 .domain([0,this.height]);
			    this.tree = d3.layout.tree().size([this.width,this.height]);
			    this.treeData = this.tree.nodes(this.data);
			    this.links = this.tree.links(this.treeData);
			    this.diagonal = d3.svg.diagonal()
		                   .projection(function(d){return [this.scaleX(d.x) , this.scaleY(d.y) ];});
                this.depth = [];
                this.maxDepth = null;

                this.defaultMode = 'add';
                this.mode = this.defaultMode;
                this.defaultGender = 'male'; 
                this.gender = this.defaultGender; 
                this.patient_him_her_self = this.data.children[0];
                this.json_parser;

                 this.json_constructor = function json_parser(){
											function objToJsonStr(Obj){
												try{
													var cache = [];
													var newJsonStr = JSON.stringify(Obj, function(key, value) {
																	    if (typeof value === 'object' && value !== null) {
																	        if (cache.indexOf(value) !== -1) {
																	            return;
																	        }
																	        cache.push(value);
																	    }
																	    return value;
																	});
													return newJsonStr;
												}
												catch(error){
													return error;
												}
											} 

											function strToJson(jsonStr){
												try{
													return JSON.parse(jsonStr);
												}
												catch(error){
													return error;
												}
											} 

											function jsonOperation(method, obj){
												if(method === 'objToJsonStr')
													return objToJsonStr(obj);
												else if(method === 'strToJson')
													return strToJson(obj);
											}
											return jsonOperation;
										};



			    this.personGenerator = function (){
			    								const name = 'Person';
			    								var newName = name + (this.links.length + 1),
			    									gender = this.gender;
				    							return {
				    									name:newName,
				    									gender:gender,
				    									isPatient_him_her_self:false,
				    									isAlive:true,
				    									dwellToghther:false,
				    									children:[]
				    									};
									    };


		    	this.familyMember = function familyMemebr(name, gender, isPatient_him_her_self, isAlive, dwellToghther){
					    		this.name = name,
					    		this.gender = gender;
					    		this.isPatient_him_her_self = isPatient_him_her_self;
					    		this.isAlive = isAlive;
					    		this.dwellToghther = dwellToghther;
					    	};

		    	//Methods
                this.count_maxDepth = function(){
					                	this.links.forEach(function(item){
							           		if(item.target.hasOwnProperty('depth'))
							           			this.depth.push(item.target.depth);
						           		}.bind(this));
					           			this.maxDepth = Math.max.apply(null, this.depth);
					           		};
           		this.draw_RedCross = function(target){
						    		d3.select(target.parentNode).append('line')
						    		.attr({x1:-this.radius, y1:-this.radius, x2:this.radius, y2:this.radius,"stroke-width":2, stroke:"red"});
						    		d3.select(target.parentNode)
						    		.append('line').attr({x1:-this.radius, y1:this.radius, x2:this.radius, y2:-this.radius,"stroke-width":2, stroke:"red"});
						    		}.bind(this);

		    	this.draw_BoundingBox = function(target){
								    		d3.select(target.parentNode)
											.append('rect')
											.attr({width:this.radius*3,height:this.radius*3,x:-this.radius*1.5,y:-this.radius*1.5,fill:'none',stroke:'steelblue','stroke-width':2});
							    		}.bind(this);

        

				this.generate_nodeAttrs = function(person){
											const defaultColor = 'white',
												  highlight = 'url(#patient)',
												  stroke = 'steelblue',
												  stroke_width = 2;
								    		var attrs = {
								    			name:person.name,
								    			gender:person.gender,
								    			isPatient_him_her_self:person.isPatient_him_her_self,
								    			isAlive:person.isAlive,
								    			dwellToghther:person.dwellToghther,
								    			fill:person.isPatient_him_her_self === true ? highlight : defaultColor,
								    			stroke:stroke,
								    			'stroke-width':stroke_width
								    		};

								    		if(person.gender === 'male')
								    		{
								    			attrs['width'] = this.radius*2;
								    			attrs['height'] = this.radius*2;
								    			attrs['x'] = -this.radius;
								    			attrs['y'] = -this.radius;
								    		}

								    		else if(person.gender === 'female')		    		
								    			attrs['r'] = this.radius;

								    		return attrs;
					    				};

		    	this.attrsToString = function (object){
							    		var output = '',
							    		variable;
							    		for(variable in object)
							    			output += (variable + '=' + '\'' + object[variable] + '\'' + ' ');
							    		return output.slice(0,output.length -1 );
						    	};
		    	this.iterate_selection = function(querySelect, operation){
											d3.selectAll(querySelect)[0].forEach(function(item){
											operation(item);
											});
			    						};


		    	this.draw_familyTree = function(){
											var attrs;
											// visualizing connections  
										    d3.select(this.lineGrp).selectAll('.link')
											    .data(this.links)
											    .enter()
											    .append('path')
											    .attr({'stroke':'#818181','stroke-width':1,'d':this.draw_connection,'fill':'none'});

										    //visualizing nodes
										    d3.select(this.nodeGrp)
										    .selectAll('g')
										    .data(this.links)
										    .enter()
										    .append('g')
										    .on('click', function(d){
										    	this.events[this.mode](d);}
										    	.bind(this))
										    .attr({index:function(d,i){
										                        	return i;},
							                    	transform : function(d){
										                        	return "translate(" + this.scaleX(d.target.x) + "," + this.scaleY(d.target.y) + ")"}
								                        		.bind(this)})
										    .html(function(d){
										    	attrs = this.attrsToString(this.generate_nodeAttrs(d.target));
										    	if(d.target.gender === 'male')
										    		return '<rect ' + attrs + '></rect>';
										    	else if(d.target.gender === 'female') 
										    		return '<circle ' + attrs + '></circle>';
										    }.bind(this));
										};

			 	this.draw_status = function(){
			 		this.iterate_selection('*[isAlive="false"]', this.draw_RedCross);
		    		this.iterate_selection('*[dwellToghther="true"]', this.draw_BoundingBox);
			 	};

			 	
			 	this.clean = function(){
			 		d3.select(this.lineGrp).html(null);
		    		d3.select(this.nodeGrp).html(null);
			 	};


			 	this.events = {
			 					add:function(d){
							 			if(d.target.hasOwnProperty('children'))
							 				d.target.children.push(self.personGenerator());
							 			else
							 			{
							 				d.target.children = [];
							 				d.target.children.push(self.personGenerator());
							 			}
							 			self.update();
			 						},

			 					remove:function(d){
			 						var counter;
			 						for(counter in d.source.children)
			 							if(d.source.children[counter].name === d.target.name)
			 							{
			 								d.source.children.splice(counter, 1);
			 								break;
			 							}
		 							self.update();
			 					},

			 					edit:function(d){
			 						d.target.gender = d.target.gender === 'male'? 'female' : 'male' ;
			 						self.update();
			 					},

			 					isAlive:function(d){
			 						d.target.isAlive = d.target.isAlive === true? false : true ;
			 						self.update();
			 					},

			 					liveTogether:function(d){
			 						d.target.dwellToghther = d.target.dwellToghther === true? false : true ;
			 						self.update();
			 					},

			 					target:function(d){
			 						
			 						if(self.patient_him_her_self !== d.target)
			 						{
			 							self.patient_him_her_self.isPatient_him_her_self = false;
										self.patient_him_her_self = d.target;
				 						d.target.isPatient_him_her_self = d.target.isPatient_him_her_self === true? false:true ;
			 						}
			 						self.update();
			 					}

		 					};

			this.isNumber = function isNumber(n) {
							  return !isNaN(parseFloat(n)) && isFinite(n);
							};
			 
			this.draw_connection = function() {
										 const d3 = 'd3_chain',
										 	   distance = 'distance';
			 							 if(arguments.length ===4 && arguments[0].constructor === Array && arguments[1].constructor === Array && this.isNumber(arguments[2]) && this.isNumber(arguments[3]))
			 							 	return this.pathGenerator(distance, arguments);
	 							 		 else if(arguments[0].constructor === Object && arguments[0].target && arguments[0].source && arguments.length ===3)
	 							 		 	return this.pathGenerator(d3, arguments[0]);
										}.bind(this);



			this.pathGenerator = function(mode, attrs) {
										if(mode === 'distance')
											{
												try{
														var m1_x = attrs[0][0];
														var m1_y = attrs[0][1];
														var v1 = attrs[1][1] + self.offsetY;
														var h1 = attrs[1][0];
														var radius = attrs[2];
														var cof = attrs[3];
				 							 			return "M" + (m1_x + radius*cof) + "," + m1_y + 
				 							 				   "V" + v1 + "H" + h1;
			 							 			}
			 							 		catch(error){
			 							 			return '提供之XY值非數字';
			 							 		}
											}
										else if(mode === 'd3_chain')
											{
												try{
														return  "M" + this.scaleX(attrs.source.x) + "," + this.scaleY(attrs.source.y) 	+ 
				 							 		 			"V" + this.scaleY(attrs.source.y + this.height / this.maxDepth / 2) + 
				 							 		 			"H" + this.scaleX(attrs.target.x) + 
				 							 		 			"V" + this.scaleY(attrs.target.y);
			 							 			}
			 							 		catch(error){
			 							 			return '提供之XY值非數字';
			 							 		}
											}
									}.bind(this);

			this.getNodePositionByIndexAndProperty = function(index, attr){
				var target = this.links[index][attr];
				return [target.x, target.y];
			};

			this.appendSvgShape = function(target, shape, attrs){
				d3.select(target).append(shape).attr(attrs);
			};


			this.draw_rootConnection = function(){
				
				const radius = 10,
					  rootPosition = this.getNodePositionByIndexAndProperty(0, 'source'),
					  cof_x = 1.5,
					  cof_y = 0.7;
					
				var counter = 0,
					length = 0,
					rectAttr = {
									x:this.links[0].source.x - this.offsetX*1.5, 
									y:this.links[0].source.y + this.offsetY*0.5,width:radius*2
									,height:radius*2,
									fill:'white',
									stroke:'steelblue',
									'stroke-width':2
								},

					circleAttr = {
									cx:this.links[0].source.x + this.offsetX*1.5, 
									cy:this.links[0].source.y + this.offsetY*0.5 + radius,
									r:radius,fill:'white',
									stroke:'steelblue',
									'stroke-width':2
								},
					shape1_x = rootPosition[0] - self.offsetX*cof_x,
					shape1_y = rootPosition[1] + self.offsetY*cof_y,
					path = null,
					pathAttrs;
					
					

				for(parent in this.data.parents){
					pathAttrs = {'stroke':'#818181','stroke-width':1,'d':null,'fill':'none'};
					this.data.parents[parent].gender === 'male'?this.appendSvgShape(self.nodeGrp, 'rect', rectAttr):this.appendSvgShape(self.nodeGrp, 'circle', circleAttr);
					length++;

					if(length%2 === 0){
						pathAttrs.d = self.draw_connection([rootPosition[0] - self.offsetX*1.5, rootPosition[1] + self.offsetY*0.7], rootPosition,radius, 1);
					}
					else{
						pathAttrs.d = self.draw_connection([rootPosition[0] + self.offsetX*1.5, rootPosition[1] + self.offsetY*0.7], rootPosition,radius, 0);
					}
					
					this.appendSvgShape(this.lineGrp, 'path', pathAttrs);
				}


				
			};



			 	//更新畫布
			 	this.update = function(){
			 		this.clean();//清空畫布
			 		//更新d3樹
			 		this.tree = d3.layout.tree().size([this.width,this.height]);
				    this.treeData = this.tree.nodes(this.data);
				    this.links = this.tree.links(this.treeData);
			 		this.count_maxDepth();
					this.draw_familyTree();;
					this.draw_status();
					this.draw_rootConnection();
			 	};



			 	
			 	this.json = new this.json_constructor();
			 	this.update();

			 	(function setup_buttons(){
                	
	                $('.treeEditMode')
			    	.each(function(){
			    		$(this)
			    		.click(function(){		    			
			    			self.mode = $(this).attr('id');
			    			$('ul#treeEditorOptions a.treeEditMode.active')
			    			.each(function(){
			    				$(this).removeClass('active');
			    			});
			    			$(this).addClass('active');
			    		});
			    	});


			    	$('.genderSwitch')
			    	.each(function(){
			    		$(this)
			    		.click(function(){
			    			self.gender = $(this).attr('id');
			    			$('ul#treeEditorOptions a.genderSwitch.active')
			    			.each(function(){
			    				$(this).removeClass('active');
			    			});
			    			$(this).addClass('active');
				    		});
				    	});

			    	$('#save').click(function(){
			    		console.log(self.json('objToJsonStr', self.data));
			    	});

		    	}());	
		    		
		}