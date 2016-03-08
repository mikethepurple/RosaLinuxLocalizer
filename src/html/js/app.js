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
				
				Bridge.save_translations(JSON.stringify(data));
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
			var list = Bridge.get_settings();
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
			
			Bridge.save_settings(JSON.stringify(data));
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
			importSelectedFiles = Bridge.open_files(1);//изначаль выбран mode = 1
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
					importSelectedFiles = Bridge.open_files(mode);
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
				var list = Bridge.import_packages(JSON.stringify(data));
			} else {
				var list = "[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"}]";	
			}
			App.packages = JSON.parse(list);
			console.log(App.packages.length + " packages loaded:\n" + JSON.stringify(App.packages));
			App.reloadPackagesList();
		});
	});
	
	App.init();
	
});
















