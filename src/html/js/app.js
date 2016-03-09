$(function() {
    console.log("application start");

	App = {
		useStubs: false,
		packages: [],
		settings: {},
		importSelectedFiles: undefined,
		
		init: function() {
			this.reloadPackagesList();
			
			$(".jsOpenSettings").on('click', this.openSettingsPage.bind(this));
			$(".jsOpenImportPackages").on('click', this.openImportPage.bind(this));
		},
		
		reloadPackagesList: function() {
			var template = $('#packageListItemTempl').html();
			Mustache.parse(template); 
			var obj = {
				"packages": this.packages, 
				"statusText": function(status) {
					switch (this.status) {
						case "2": return "Готов к локализации";
						case "3": return "Не найдены строки для локализации";
						case "4": return "Локализация добавлена";
						default: return "Статус неизвестен";
					}
				}
			}
			var rendered = Mustache.render(template, obj);
			$('#packages_list_container').html(rendered);
			
			$(".jsPackagesListItem").on('click', this.displayPackage.bind(this));
		},
		
		displayPackage: function(event) {
			this.clearCurrentLocation();
			if ($(event.target).data("id")) {
				var id = $(event.target).data("id");
				$(".jsPackagesListItem").removeClass("active");
				$(event.target).addClass("active");
			} else {
				var id = $(event.target.parentElement).data("id");
				$(event.target.parentElement).addClass("active");
			}
			
			var template = $('#packageTempl').html();
			Mustache.parse(template); 
			var rendered = Mustache.render(template, this.getPackageByProjectId(id));
			$('#workplace_container').html(rendered);
			
			$(".jsMachineTranslation").on('click', this.translateField.bind(this));
			$(".jsSaveTranslationsButton").on('click', this.saveTranslations.bind(this));
		},
		
		translateField: function(event) {
			var textEn = $(event.target).parent().prev().find("div.well").text();
			console.log(textEn);
			var targetField = $(event.target).next();
			var textRu = targetField.val();
			console.log(textRu);
			var self = this;
			if (textRu.trim().length > 0) { 
				bootbox.dialog({
					message: "Поле перевода уже содержит текст.<br>Существующий текст будет заменен на машинный перевод.",
					title: "Удалить существующий перевод?",
					onEscape: function() {},
					show: true,
					backdrop: true,
					closeButton: true,
					animate: true,
					className: "confirm-replace-russian-text",
					buttons: {
							"Отменить": function() {},
							"Продолжить": {
									className: "btn-warning",
									callback: function() {
										if (!self.useStubs) {
											var translatedText = Bridge.get_translation(textEn);
										} else {
											var translatedText = "Переведенный текст.";
										}
										targetField.val(translatedText);
									}
							},
					}
					});
			} else {
				if (!self.useStubs) {
					var translatedText = Bridge.get_translation(textEn);
				} else {
					var translatedText = "Переведенный текст.";
				}
				targetField.val(translatedText);
			}
		},
		
		saveTranslations: function(event) {
			event.preventDefault();
			$form = $(".translationsForm");
			
			$desktopFiles = $(".translationsForm .desktopFile");
			var files = [];
			
			$.each($desktopFiles, function( index, value ) {
				var obj = {path: $(value).find(".desktopFilePath").html(), strings: []};
				var strs = $(value).find(".stringForTranslate");
				var stringList = [];
				$.each(strs, function( index, value ) {
					var str = {
						variable_name: $(value).data("varname"),
						value: {
							en: $(value).find("#stringEn").html(),
							ru: $(value).find("#stringRu").val()
						}
					};
					stringList.push(str);
				});
				
				obj.strings = stringList;
				
				files.push(obj);
			});
							
			var data = {
				git: $(".gitRepository").html(),
				desktop_files: files
			};
			
			console.log(data);
			
			Bridge.save_translations(JSON.stringify(data));
		},
		
		getPackageByProjectId: function(projectId) {
			var res = null;
			$.each(this.packages, function( index, value ) {
				if (value.project_id === projectId) {
					res = value;
					res.has_desktop_files = res.desktop_files && res.desktop_files.length && (res.desktop_files.length > 0);
					console.log(res);
					return false;
				}
			});
			return res;
		},
		
		clearCurrentLocation: function() {
			$(".nav li").removeClass("active");
			$(".jsPackagesListItem").removeClass("active");
		},
		
		openSettingsPage: function(event) {
			var hasError = false;
			try {
				if (!this.useStubs) {
					var list = Bridge.get_settings();
				} else {
					var list = "{\"yandex_api_key\":\"webuy23dn289fydvbh8912e9vcydbu2e3rgvbudio2ecbudnvucbdowbu\",\"abf_projects_group\":\"import\",\"abf_login\":\"login\",\"abf_password\":\"password\",\"branches\":[{\"name\":\"import_cooker\",\"active\":false,\"first\":true},{\"name\":\"import_mandriva\",\"active\":false,\"first\":false},{\"name\":\"master\",\"active\":false,\"first\":false},{\"name\":\"red3\",\"active\":false,\"first\":false},{\"name\":\"rosa2012.1\",\"active\":false,\"first\":false},{\"name\":\"rosa2012lts\",\"active\":false,\"first\":false},{\"name\":\"rosa2014.1\",\"active\":true,\"first\":false}],\"variables\":[{\"name\":\"Name\",\"last\":false},{\"name\":\"Comment\",\"last\":true}]}";	
				}
				this.settings = JSON.parse(list);
			} catch (e) {
				hasError = true;
				console.log("error while loading settings: " + e);
				
				this.settings = {
									yandex_api_key: "",
									abf_projects_group: "",
									abf_login: "",
									abf_password: "",
									branches: [],
									variables: []
								}
			}
			
			var template = $('#settingsTempl').html();
			Mustache.parse(template); 
			var rendered = Mustache.render(template, App.settings);
			$('#workplace_container').html(rendered);
			this.clearCurrentLocation();
			$(event.target).parent().addClass("active");
			
			if (hasError) {
				$(".errorSettingsContainer").html("Ошибка при загрузке настроек!<br>Целостность файла конфигурации могла быть нарушена, при сохранении настроек конфигурация перезапишется.");
				$(".errorSettingsContainer").show();
			}
			
			$(".variablesForTranslateContainer").tooltip();
			$(".variablesForTranslate").tokenfield();
			
			$(".jsDeleteBranch").on('click', this.deleteBrunch.bind(this));
			$(".jsAddBrunchButton").on('click', this.addBrunch.bind(this));
			$(".jsSaveSettingsButton").on('click', this.saveSettings.bind(this));
			$(".jsAddBrunchField").on('focus blur', this.hideBrunchErrors.bind(this));
			
			$form = $(".settingsForm");
			$form.find("#inputYandexApiKey").on('focus blur', this.hideSettingsInfoContainer.bind(this));
			$form.find("#inputProjectGroup").on('focus blur', this.hideSettingsInfoContainer.bind(this));
			$form.find("#inputLogin").on('focus blur', this.hideSettingsInfoContainer.bind(this));
			$form.find("#inputPassword").on('focus blur', this.hideSettingsInfoContainer.bind(this));
			$(".jsAddBrunchField").on('focus blur', this.hideSettingsInfoContainer.bind(this));
		},
		
		deleteBrunch: function(event) {
			event.preventDefault();
			if ($(".branchesRadios").children().size() > 1) {
				var $el = $(event.target).closest("button").parent();
				var check = false;
				if ($el.find("input[type=radio]").is(":checked")) {
					check = true;
				}
				$el.remove();
				if (check) {
					$($(".branchesRadios").children()[0]).find("input[type=radio]").prop("checked", true);
				}
			} else {
				var $er = $(".errorBrunchContainer");
				$er.html("Должна оставаться хотя бы одна ветка!");
				$er.show();
			}
		},
		
		addBrunch: function(event) {
			event.preventDefault();
			var text = $(".jsAddBrunchField").val().trim();
			var $er = $(".errorAddBrunchContainer");
			if (text.length > 0) {
				var brunches = $($(".branchesRadios").children()).map(function() {
					return $(this).find("input").val();
				}).get();
				
				console.log(brunches.join(", "));
				
				if( $.inArray(text, brunches) == -1) {
					var check = '';
					if ($(".branchesRadios").children().size() === 0) {
						check = ' checked="checked"';
					}
					$er.hide();
					$(".jsAddBrunchField").val("");
					$(".branchesRadios").append('<div class="radio">'+
												'	<label>'+
												'		<input type="radio" name="currentBranch" value="'+ text +'"'+ check +'>'+ text +
												'	</label>'+
												'	<button type="button" class="close delete_branch jsDeleteBranch" aria-label="Remove"><span aria-hidden="true">&times;</span></button>'+
												'</div>');
					$(".jsDeleteBranch").off('click');
					$(".jsDeleteBranch").on('click', this.deleteBrunch.bind(this));
				} else {
					$er.html("Такая ветка уже добавлена!")
					$er.show();
				}
			} else {
				$er.html("Поле не должно быть пустым!")
				$er.show();
			}
		},
	
		saveSettings: function(event) {
			event.preventDefault();
			$form = $(".settingsForm");
			
			var data = {
				yandex_api_key: $form.find("#inputYandexApiKey").val().trim(),
				abf_projects_group:$form.find("#inputProjectGroup").val().trim(),
				abf_login:$form.find("#inputLogin").val().trim(),
				abf_password:$form.find("#inputPassword").val().trim(),
				branches: [],
				variables: []
			};
			
			if (data.yandex_api_key.length > 0) {
				if (data.abf_projects_group.length > 0) {
					if (data.abf_login.length > 0) {
						if (data.abf_password.length > 0) {
							var vars_string = $form.find("#inputVariables").val().trim();
							
							if (vars_string.length > 0) {
								var vars = vars_string.split(',');
								var variablesList = [];
								
								var l = false;
								$.each(vars, function( index, value ) {
									if (index === (vars.length - 1)) {
										l = true;
									}
									var variable = {name: value.trim(), last: l};
									variablesList.push(variable);
								});
							
								var br = [];
								var $radios = $form.find("[type=radio]");
								$.each($radios, function( index, value ) {
									var obj = {name: $(value).attr("value"), active: ($(value).is(":checked"))};
									br.push(obj);
								});
								
								if (br.length > 0) {
									data.branches = br;
									data.variables = variablesList;
									
									console.log(data);
									
									try {
                                        var result = JSON.parse(Bridge.save_settings(JSON.stringify(data)));
										if(!(result.error && result.error.length > 0)) {
                                            this.showSettingsSuccessMessage("Настройки сохранены.");
                                        } else {
                                            console.log("error while saving settings: " + result.error);
                                            this.showSettingsErrorMessage(result.error);
                                        }
									} catch (e) {
										console.log("error while saving settings: " + e);
										this.showSettingsErrorMessage("Ошибка при сохранении настроек! Попробуйте еще раз.");
									}
								} else {
									this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Добавьте хотя бы одну ветку.");
								}
							} else {
								this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Добавьте хотя бы одну переменную для локализации.");
							}
						} else {
							this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Введите пароль.");
						}
					} else {
						this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Введите логин.");
					}
				} else {
					this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Введите группу проектов.");
				}
			} else {
				this.showSettingsErrorMessage("Ошибка при сохранении настроек!<br>Введите API ключ.");
			}
		},
		
		hideBrunchErrors: function(event) {
			$(".errorAddBrunchContainer").hide();
			$(".errorBrunchContainer").hide();
		},

        showSettingsErrorMessage: function(error) {
            $(".errorSettingsContainer").html(error);
            $(".errorSettingsContainer").show();
            $('.right_block').scrollTop(0);
        },
        
        showSettingsSuccessMessage: function(text) {
            $(".successSettingsContainer").html(text);
            $(".successSettingsContainer").show();
            $('.right_block').scrollTop(0);
        },
		
		hideSettingsInfoContainer: function(event) {
			$(".errorSettingsContainer").hide();
			$(".successSettingsContainer").hide();
		},
		
		openImportPage: function(event) {
			var template = $('#importPackagesTempl').html();
			Mustache.parse(template); 
			var rendered = Mustache.render(template, App.settings);
			$('#workplace_container').html(rendered);
			App.clearCurrentLocation();
			$(event.target).parent().addClass("active");
			
			$(".jsOpenFilesButton").on('click', {mode: 1}, this.openFileChooser.bind(this));
			$("input[type=radio][name=importType]").on('change', this.changeImportType.bind(this));	
			$(".jsImportPackagesButton").on('click', this.importPackages.bind(this));		
		},
		
		openFileChooser: function(event) {
            this.hideImportInfoContainer();
			event.preventDefault();
			console.log("openFileChooser, mode: "+event.data.mode);
			this.importSelectedFiles = Bridge.open_files(event.data.mode);//изначально выбран mode = 1
			console.log(this.importSelectedFiles);
		},
		
		changeImportType: function(event) {
            this.hideImportInfoContainer();
			var mode = 0;
			var type = $(event.target).val();
			if (type == 'repo') {
				var template = $('#importControlRepoTempl').html();
			}
			else if (type == 'files' || type == 'dir' || type == 'custom') {
				var template = $('#importControlFileTempl').html();
				
				if (type === 'files') { mode = 1; }
				if (type === 'dir') { mode = 2; }
				if (type === 'custom') { mode = 3; }
			}
			Mustache.parse(template); 
			var rendered = Mustache.render(template, {"files": !(type == 'dir'), "multiple":(type == 'files')});
			$('#import_control_container').html(rendered);
			
			if (type == 'files' || type == 'dir' || type == 'custom') {
				$(".jsOpenFilesButton").on('click', {mode: mode}, this.openFileChooser.bind(this));
			}
		},
	
		importPackages: function(event) {
            this.hideImportInfoContainer();
			event.preventDefault();
			try {
				if (!App.useStubs) {
					var $form = $(".importForm");
					var data = {
						type: $form.find(":checked").val(),
						values: JSON.parse(this.importSelectedFiles) || [ $form.find("#importControlLabel").val() ]
					};
					this.importSelectedFiles = undefined;
					var list = Bridge.import_packages(JSON.stringify(data));
				} else {
					var list = "{\"error\":\"\",\"packages\":[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"������������\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"�������� ���������\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":4334,\"rpm\":\"volatile-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile\",\"git\":\"https://abf.io/import/volatile.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console volatile jsut for fun.\"}}]}],\"status\":\"3\"},{\"project_id\":434,\"rpm\":\"pidgin2-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin2\",\"git\":\"https://abf.io/import/pidgin2.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin2.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin2\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment2 about this package.\"}}]},{\"path\":\"usr/share/desc/info2.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console2 application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":3232,\"rpm\":\"volatile2-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile2\",\"git\":\"https://abf.io/import/volatile2.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol2.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile2\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another 2comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol2.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console2 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":111111,\"rpm\":\"pidgin3-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin3\",\"git\":\"https://abf.io/import/pidgin3.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin3.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin3\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another3 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info3.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 3application for educational purposes.\"}}]}],\"status\":\"3\"},{\"project_id\":342,\"rpm\":\"volatile3-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile3\",\"git\":\"https://abf.io/import/volatile3.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol3.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile3\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another3 comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol3.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console3 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":22222,\"rpm\":\"pidgin4-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin4\",\"git\":\"https://abf.io/import/pidgin4.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin4.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin4\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another4 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info4.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 4application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":986,\"rpm\":\"volatile4-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile4\",\"git\":\"https://abf.io/import/volatile4.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol4.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile4\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another4 comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol4.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console4 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":874432,\"rpm\":\"terminology5-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology5\",\"git\":\"https://abf.io/import/terminology5.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology5.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology5\",\"ru\":\"������������\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal 5\",\"ru\":\"�������� ���������\"}}]}],\"status\":\"4\"},{\"project_id\":543221,\"rpm\":\"pidgin5-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin5\",\"git\":\"https://abf.io/import/pidgin5.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin5.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin5\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another5 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info5.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console5 application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":123,\"rpm\":\"terminology6-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology6\",\"git\":\"https://abf.io/import/terminology6.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology6.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology6\",\"ru\":\"������������\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator6\",\"ru\":\"�������� ���������\"}}]}],\"status\":\"4\"},{\"project_id\":456,\"rpm\":\"pidgin6-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin6\",\"git\":\"https://abf.io/import/pidgin6.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin6.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin6\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment6 about this package.\"}}]},{\"path\":\"usr/share/desc/info6.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 6application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":3211111,\"rpm\":\"terminology7-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology7\",\"git\":\"https://abf.io/import/terminology7.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology7.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology7\",\"ru\":\"������������\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator7\",\"ru\":\"�������� ���������\"}}]}],\"status\":\"4\"},{\"project_id\":4567777,\"rpm\":\"pidgin7-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin7\",\"git\":\"https://abf.io/import/pidgin7.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin7.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"fggfggf 7\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment 7about this package.\"}}]},{\"path\":\"usr/share/desc/info7.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 7application for educational purposes.\"}}]}],\"status\":\"2\"}]}";
					//var list = "{\"error\":\"Файл terminology-0.9.0-1-rosa2014.1.x86_64.rpm поврежден!\",\"packages\":[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"������������\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"�������� ���������\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"}]}";
					//var list = "{\"error\":\"Файл terminology-0.9.0-1-rosa2014.1.x86_64.rpm поврежден!\"}";
				}
			
				var json_list = JSON.parse(list);
				if (json_list.error && json_list.error.length > 0) {
					console.log("error while importing packages: " + json_list.error);
					this.showImportErrorMessage(json_list.error);
				} 
				
				if (json_list.packages) {
					App.packages = json_list.packages;
					console.log(App.packages.length + " packages loaded:\n" + JSON.stringify(App.packages));
					App.reloadPackagesList();

                    this.showImportSuccessMessage("Импорт успешно завершен! Импортировано пакетов: " + App.packages.length);
				}
			} catch (e) {
				console.log("error while importing packages: " + e);
				this.showImportErrorMessage("Ошибка при импорте пакетов! Проверьте целостность данных и попробуйте еще раз.");
			}
		},

        showImportErrorMessage: function(error) {
            $(".errorImportContainer").html(error);
            $(".errorImportContainer").show();
            $('.right_block').scrollTop(0);
        },

        showImportSuccessMessage: function(text) {
            $(".successImportContainer").html(text);
            $(".successImportContainer").show();
            $('.right_block').scrollTop(0);
        },


        hideImportInfoContainer: function() {
            $(".errorImportContainer").hide();
            $(".successImportContainer").hide();
        }

	};
	
	App.init();
	
});
















