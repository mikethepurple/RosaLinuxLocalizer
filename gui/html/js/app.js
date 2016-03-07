$(function() {
    console.log("application start");

	App = {
		useStubs: false,
		packages: [],
		settings: {},
		
		init: function() {
			this.reloadPackagesList();
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
			
			var self = this;
			$(".jsPackagesListItem").click(function(e) {
				if ($(e.target).data("id")) {
					var id = $(e.target).data("id");
					$(".jsPackagesListItem").removeClass("active");
					self.clearCurrentLocation();
					$(e.target).addClass("active");
				} else {
					var id = $(e.target.parentElement).data("id");
					self.clearCurrentLocation();
					$(e.target.parentElement).addClass("active");
				}
				self.displayPackage(id);
			});
		},
		
		displayPackage: function(projectId) {
			var template = $('#packageTempl').html();
			Mustache.parse(template); 
			var rendered = Mustache.render(template, this.getPackageByProjectId(projectId));
			$('#workplace_container').html(rendered);
			
			var self = this;
			$(".jsMachineTranslation").click(function(e) {
				var textEn = $(e.target).parent().prev().find("div.well").text();
				console.log(textEn);
				var targetField = $(e.target).next();
				var textRu = targetField.val();
				console.log(textRu);
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
												var translatedText = Bridge.getTranslation(textEn);
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
						var translatedText = Bridge.getTranslation(textEn);
					} else {
						var translatedText = "Переведенный текст.";
					}
                    targetField.val(translatedText);
				}
			});
			
			$(".jsSaveTranslationsButton").click(function(e){
				e.preventDefault();
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
				
				Bridge.saveTranslations(JSON.stringify(data));
			});
		},
		
		getPackageByProjectId: function(projectId) {
			var res = null;
			$.each(this.packages, function( index, value ) {
				if (value.project_id === projectId) {
					res = value;
					console.log(value);
					return false;
				}
			});
			return res;
		},
		
		clearCurrentLocation: function() {
			$(".nav li").removeClass("active");
			$(".jsPackagesListItem").removeClass("active");
		}
	};
	
	$(".jsOpenSettings").click(function(e){
		if (!App.useStubs) {
			var list = Bridge.getSettings();
		} else {
			var list = "{\"yandex_api_key\":\"webuy23dn289fydvbh8912e9vcydbu2e3rgvbudio2ecbudnvucbdowbu\",\"abf_projects_group\":\"import\",\"abf_login\":\"login\",\"abf_password\":\"password\",\"branches\":[{\"name\":\"import_cooker\",\"active\":false,\"first\":true},{\"name\":\"import_mandriva\",\"active\":false,\"first\":false},{\"name\":\"master\",\"active\":false,\"first\":false},{\"name\":\"red3\",\"active\":false,\"first\":false},{\"name\":\"rosa2012.1\",\"active\":false,\"first\":false},{\"name\":\"rosa2012lts\",\"active\":false,\"first\":false},{\"name\":\"rosa2014.1\",\"active\":true,\"first\":false}],\"variables\":[{\"name\":\"Name\",\"last\":false},{\"name\":\"Comment\",\"last\":true}]}";	
		}
		App.settings = JSON.parse(list);
		var template = $('#settingsTempl').html();
		Mustache.parse(template); 
		var rendered = Mustache.render(template, App.settings);
		$('#workplace_container').html(rendered);
		App.clearCurrentLocation();
		$(e.target).parent().addClass("active");
		
		$(".jsSaveSettingsButton").click(function(e){
			e.preventDefault();
			$form = $(".settingsForm");
			var br = [];
			var $radios = $form.find("[type=radio]");
			var f = true;
			$.each($radios, function( index, value ) {
				var obj = {name: $(value).attr("value"), active: ($(value).is(":checked")), first: f};
				f = false;
				br.push(obj);
			});
			
			var vars = $form.find("#inputVariables").val().split(',');
			var variablesList = [];
			
			var l = false;
			$.each(vars, function( index, value ) {
				if (index === (vars.length - 1)) {
					l = true;
				}
				var variable = {name: value.trim(), last: l};
				variablesList.push(variable);
			});
			
			
			var data = {
				yandex_api_key: $form.find("#inputYandexApiKey").val(),
				abf_projects_group:$form.find("#inputProjectGroup").val(),
				abf_login:$form.find("#inputLogin").val(),
				abf_password:$form.find("#inputPassword").val(),
				branches: br,
				variables: variablesList
			};
			console.log(data);
			
			Bridge.saveSettings(JSON.stringify(data));
		});
	});
	
	
	var importSelectedFiles = undefined;
	
	$(".jsOpenImportPackages").click(function(e){
		var template = $('#importPackagesTempl').html();
		Mustache.parse(template); 
		var rendered = Mustache.render(template, App.settings);
		$('#workplace_container').html(rendered);
		App.clearCurrentLocation();
		$(e.target).parent().addClass("active");
		
		$('.jsOpenFilesButton').click(function(e){
			e.preventDefault();
			importSelectedFiles = Bridge.openFiles(1);//изначально выбран mode = 1
			console.log(importSelectedFiles);
		});
		
		$('input[type=radio][name=importType]').change(function() {
			var mode = 0;
			if (this.value == 'repo') {
				var template = $('#importControlRepoTempl').html();
			}
			else if (this.value == 'files' || this.value == 'dir' || this.value == 'custom') {
				var template = $('#importControlFileTempl').html();
				
				if (this.value === 'files') { mode = 1; }
				if (this.value === 'dir') { mode = 2; }
				if (this.value === 'custom') { mode = 3; }
			}
			Mustache.parse(template); 
			var rendered = Mustache.render(template, {"files": !(this.value == 'dir'), "multiple":(this.value == 'files')});
			$('#import_control_container').html(rendered);
			
			if (this.value == 'files' || this.value == 'dir' || this.value == 'custom') {
				$('.jsOpenFilesButton').click(function(e){
					e.preventDefault();
					importSelectedFiles = Bridge.openFiles(mode);
					console.log(importSelectedFiles);
				});
			}
			
		});
		
		
		$(".jsImportPackagesButton").click(function(e){
			e.preventDefault();
			var $form = $(".importForm");
			var data = {
				type: $form.find(":checked").val(),
				values: importSelectedFiles || [ $form.find("#importControlLabel").val() ]
			};
			importSelectedFiles = undefined;
			if (!App.useStubs) {
				var list = Bridge.importPackages(JSON.stringify(data));
			} else {
				var list = "[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":4334,\"rpm\":\"volatile-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile\",\"git\":\"https://abf.io/import/volatile.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console volatile jsut for fun.\"}}]}],\"status\":\"3\"},{\"project_id\":434,\"rpm\":\"pidgin2-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin2\",\"git\":\"https://abf.io/import/pidgin2.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin2.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin2\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment2 about this package.\"}}]},{\"path\":\"usr/share/desc/info2.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console2 application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":3232,\"rpm\":\"volatile2-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile2\",\"git\":\"https://abf.io/import/volatile2.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol2.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile2\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another 2comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol2.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console2 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":111111,\"rpm\":\"pidgin3-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin3\",\"git\":\"https://abf.io/import/pidgin3.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin3.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin3\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another3 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info3.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 3application for educational purposes.\"}}]}],\"status\":\"3\"},{\"project_id\":342,\"rpm\":\"volatile3-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile3\",\"git\":\"https://abf.io/import/volatile3.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol3.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile3\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another3 comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol3.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console3 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":22222,\"rpm\":\"pidgin4-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin4\",\"git\":\"https://abf.io/import/pidgin4.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin4.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin4\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another4 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info4.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 4application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":986,\"rpm\":\"volatile4-1.12.0-rosa2014.1.id586.rpm\",\"package_name\":\"volatile4\",\"git\":\"https://abf.io/import/volatile4.git\",\"desktop_files\":[{\"path\":\"usr/share/vol/vol4.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Volatile4\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another4 comment about this vol.\"}}]},{\"path\":\"usr/share/desc/vol4.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console4 volatile jsut for fun.\"}}]}],\"status\":\"1\"},{\"project_id\":874432,\"rpm\":\"terminology5-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology5\",\"git\":\"https://abf.io/import/terminology5.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology5.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology5\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal 5\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":543221,\"rpm\":\"pidgin5-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin5\",\"git\":\"https://abf.io/import/pidgin5.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin5.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin5\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another5 comment about this package.\"}}]},{\"path\":\"usr/share/desc/info5.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console5 application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":123,\"rpm\":\"terminology6-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology6\",\"git\":\"https://abf.io/import/terminology6.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology6.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology6\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator6\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":456,\"rpm\":\"pidgin6-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin6\",\"git\":\"https://abf.io/import/pidgin6.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin6.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin6\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment6 about this package.\"}}]},{\"path\":\"usr/share/desc/info6.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 6application for educational purposes.\"}}]}],\"status\":\"2\"},{\"project_id\":3211111,\"rpm\":\"terminology7-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology7\",\"git\":\"https://abf.io/import/terminology7.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology7.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology7\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator7\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":4567777,\"rpm\":\"pidgin7-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin7\",\"git\":\"https://abf.io/import/pidgin7.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin7.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"fggfggf 7\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment 7about this package.\"}}]},{\"path\":\"usr/share/desc/info7.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console 7application for educational purposes.\"}}]}],\"status\":\"2\"}]";	
				//var list = "[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"}]";
			}
			App.packages = JSON.parse(list);
			console.log(App.packages.length + " packages loaded:\n" + JSON.stringify(App.packages));
			App.reloadPackagesList();
		});
	});
	
	App.init();
	
});
















