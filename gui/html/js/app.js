$(function() {
    console.log("application start");

	App = {
		useStubs: false,
		packages: [],
		settings: {},
		
		init: function() {
			this.reloadPackagesList();
		},
		
		/*loadPackages: function () {
			var list = Bridge.getPackages();
			//var list = "[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"}]";
			this.packages = JSON.parse(list);
			console.log(this.packages.length + " packages loaded:\n" + JSON.stringify(this.packages));
			
			this.reloadPackagesList();
		},*/
		
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
	
	$(".jsOpenImportPackages").click(function(e){
		var template = $('#importPackagesTempl').html();
		Mustache.parse(template); 
		var rendered = Mustache.render(template, App.settings);
		$('#workplace_container').html(rendered);
		App.clearCurrentLocation();
		$(e.target).parent().addClass("active");
		
		$('input[type=radio][name=importType]').change(function() {
			if (this.value == 'files' || this.value == 'custom') {
				var template = $('#importControlFileTempl').html();
			}
			else if (this.value == 'repo') {
				var template = $('#importControlRepoTempl').html();
			}
			Mustache.parse(template); 
			var rendered = Mustache.render(template, {"multiple":(this.value == 'files')});
			$('#import_control_container').html(rendered);
		});
		
		$(".jsImportPackagesButton").click(function(e){
			e.preventDefault();
			var $form = $(".importForm");
			var data = {
				type: $form.find(":checked").val(),
				values: [
					$form.find("#importControlLabel").val()
				]
			};
			if (!App.useStubs) {
				var list = Bridge.importPackages(JSON.stringify(data));
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
















