$(function() {
    console.log("application start");

	App = {
		useStubs: false,
		packages: [],
		settings: {},
		importSelectedFiles: undefined,

		init: function() {
			this.reloadPackagesList();
			
			$(".jsOpenSettingsMenuItem").on('click', this.openSettingsMenuItemClicked.bind(this));
			$(".jsOpenImportPackagesMenuItem").on('click', this.openImportPageMenuItemClicked.bind(this));

            $(".jsAllPackagesAddMissedTranslatesMenuItem").on('click', this.addAllPackagesMissedTranslatesMenuItemClicked.bind(this));
            $(".jsAllPackagesCommitPatchesMenuItem").on('click', this.allPackagesCommitPatchesMenuItemClicked.bind(this));
            $(".jsAllPackagesHideLocalizedMenuItem").on('click', this.allPackagesHideLocalizedMenuItemClicked.bind(this));
		},

        clearCurrentLocation: function() {
			$(".nav li").removeClass("active");
			$(".jsPackagesListItem").removeClass("active");

            var $activePackageCommandsMenuItem = $(".jsActivePackageCommandsMenuItem");
            if (!$activePackageCommandsMenuItem.hasClass("disabled")) {
                $activePackageCommandsMenuItem.addClass("disabled");
            }
		},




        /* ====   Events   ==== */

        /* import */

        openImportPageMenuItemClicked: function(event) {
			var template = $('#importPackagesTempl').html();
			Mustache.parse(template);
			var rendered = Mustache.render(template, App.settings);
			$('#workplace_container').html(rendered);
			App.clearCurrentLocation();
			$(event.target).parent().addClass("active");

			$(".jsOpenFilesButton").on('click', {mode: 1}, this.openFileChooserButtonClicked.bind(this));
			$("input[type=radio][name=importType]").on('change', this.changeImportTypeRadioClicked.bind(this));
            this.initPopoverForImportHelp();
            $(".jsShowImportCustomTypeHelpButton").on('click', function() {
                $(".jsShowImportCustomTypeHelpButton").popover('show');
            });
			$(".jsImportPackagesButton").on('click', this.importPackagesButtonClicked.bind(this));
		},

        changeImportTypeRadioClicked: function(event) {
            this.hideImportMessageContainers();
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

            this.importSelectedFiles = undefined;
            this.reloadImportControls();

			if (type == 'files' || type == 'dir' || type == 'custom') {
				$(".jsOpenFilesButton").on('click', {mode: mode}, this.openFileChooserButtonClicked.bind(this));
			} else {
                $(".jsImportRepoInput").on('input', this.reloadImportControls.bind(this));
            }
		},

		openFileChooserButtonClicked: function(event) {
            this.hideImportMessageContainers();
			event.preventDefault();
			console.log("openFileChooser, mode: "+event.data.mode);
            try {
                var result = Bridge.open_files(event.data.mode);
                this.importSelectedFiles = JSON.parse(result);//изначально выбран mode = 1
            } catch (e) {
                console.log("error while open files: " + e);
				this.showImportErrorMessage("<strong>Ошибка при выборе файлов!</strong> Попробуйте еще раз.");
                this.importSelectedFiles = undefined;
            }
            this.reloadImportControls();
			console.log(this.importSelectedFiles);
		},

        importPackagesButtonClicked: function(event) {
            this.hideImportMessageContainers();
			event.preventDefault();
			try {
				if (!App.useStubs) {
					var $form = $(".importForm");
					var data = {
						type: $form.find(":checked").val(),
						values: this.importSelectedFiles || [ $form.find(".jsImportRepoInput").val().trim() ]
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
					this.showImportErrorMessage('<strong>' + json_list.error + '</strong>');
				}

				if (json_list.packages) {
					App.packages = json_list.packages;

                    this.setInitialStatuses();

					console.log(App.packages.length + " packages loaded:\n" + JSON.stringify(App.packages));
					App.reloadPackagesList();

                    this.showImportSuccessMessage("<strong>Импорт успешно завершен!</strong> Импортировано пакетов: " + App.packages.length);
				}
			} catch (e) {
				console.log("error while importing packages: " + e);
				this.showImportErrorMessage("<strong>Ошибка при импорте пакетов!</strong> Проверьте целостность данных и попробуйте еще раз.");
			}
		},

        /* settings */

        openSettingsMenuItemClicked: function(event) {
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
                this.showSettingsErrorMessage("<strong>Ошибка при загрузке настроек!</strong> Целостность файла конфигурации могла быть нарушена, при сохранении настроек конфигурация перезапишется.");
			}

			$(".variablesForTranslateContainer").tooltip();
			$(".variablesForTranslate").tokenfield();

			$(".jsDeleteBranchButton").on('click', this.deleteBrunchButtonClicked.bind(this));
			$(".jsAddBrunchButton").on('click', this.addBrunchButtonClicked.bind(this));
			$(".jsSaveSettingsButton").on('click', this.saveSettingsButtonClicked.bind(this));
			$(".jsAddBrunchField").on('focus blur', this.hideBrunchErrors.bind(this));

			$form = $(".settingsForm");
			$form.find("#inputYandexApiKey").on('focus blur', this.hideSettingsMessageContainers.bind(this));
			$form.find("#inputProjectGroup").on('focus blur', this.hideSettingsMessageContainers.bind(this));
			$form.find("#inputLogin").on('focus blur', this.hideSettingsMessageContainers.bind(this));
			$form.find("#inputPassword").on('focus blur', this.hideSettingsMessageContainers.bind(this));
			$(".jsAddBrunchField").on('focus blur', this.hideSettingsMessageContainers.bind(this));
		},

        deleteBrunchButtonClicked: function(event) {
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
				$(".errorBrunchText").html("<strong>Должна оставаться хотя бы одна ветка!</strong>");
				$(".errorBrunchContainer").show();
			}
		},

		addBrunchButtonClicked: function(event) {
			event.preventDefault();
			var text = $(".jsAddBrunchField").val().trim();
			var $er = $(".errorAddBrunchContainer");
			var $erText = $(".errorAddBrunchText");
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
												'	<button type="button" class="close delete_branch jsDeleteBranchButton" aria-label="Remove"><span aria-hidden="true">&times;</span></button>'+
												'</div>');
					$(".jsDeleteBranchButton").off('click');
					$(".jsDeleteBranchButton").on('click', this.deleteBrunchButtonClicked.bind(this));
				} else {
					$erText.html("<strong>Такая ветка уже добавлена!</strong>")
					$er.show();
				}
			} else {
				$erText.html("<strong>Поле не должно быть пустым!</strong>")
				$er.show();
			}
		},

		saveSettingsButtonClicked: function(event) {
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
                                            this.showSettingsSuccessMessage("<strong>Настройки сохранены.</strong>");
                                        } else {
                                            console.log("error while saving settings: " + result.error);
                                            this.showSettingsErrorMessage("<strong>" + result.error + "</strong>");
                                        }
									} catch (e) {
										console.log("error while saving settings: " + e);
										this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Попробуйте еще раз.");
									}
								} else {
									this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Добавьте хотя бы одну ветку.");
								}
							} else {
								this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Добавьте хотя бы одну переменную для локализации.");
							}
						} else {
							this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Введите пароль.");
						}
					} else {
						this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Введите логин.");
					}
				} else {
					this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Введите группу проектов.");
				}
			} else {
				this.showSettingsErrorMessage("<strong>Ошибка при сохранении настроек!</strong> Введите API ключ.");
			}
		},

        /* packages */

        packagesListItemClicked: function(event) {
			this.clearCurrentLocation();
			if ($(event.target).data("id")) {
				var id = $(event.target).data("id");
				$(".jsPackagesListItem").removeClass("active");
				$(event.target).addClass("active");
			} else {
				var id = $(event.target.parentElement).data("id");
				$(event.target.parentElement).addClass("active");
			}

            $(".jsActivePackageCommandsMenuItem").removeClass("disabled");

			this.displayPackage(id);
		},

        translateFieldButtonClicked: function(event) {
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
                                        self.translateField(targetField, textEn);
									}
							},
					}
					});
			} else {
                this.translateField(targetField, textEn);
			}
		},

        addActivePackageMissedTranslatesMenuItemClicked: function(event) {
            var id = event.data.id;
            var p = this.getPackageByProjectId(id);

            this.addMissedTranslations(p);

            p.status = 4; //т.к. после заполнения всех пустых полей пакет становится локализированным
            this.reloadPackagesList(id);
            this.displayPackage(id);
        },

        addAllPackagesMissedTranslatesMenuItemClicked: function(event) {
            var self = this;
            $.each(this.packages, function (index, p) {
                if (p.status === 2 || p.status == 3 || (p.status === 4 && self.checkEmptyStrings(p.desktop_files))) {
                    p.status = 4;
                }
                self.addMissedTranslations(p);
            });
            this.reloadPackagesList();
        },

        hideActivePackageMenuItemClicked: function(event) {
            var id = event.data.id;
            var self = this;
            bootbox.dialog({
                message: "Скрытие пакета удалит его из списка.",
                title: "Скрыть пакет?",
                onEscape: function() {},
                show: true,
                backdrop: true,
                closeButton: true,
                animate: true,
                className: "confirm-hide-package-text",
                buttons: {
                    "Отменить": function() {},
                    "<span class=\"glyphicon glyphicon-remove\"></span> Скрыть": {
                        className: "btn-danger",
                        callback: function() {
                            self.packages = $.grep(self.packages, function(p){
                                 return p.project_id != id;
                            });
                            self.clearCurrentLocation();
                            self.reloadPackagesList();
                        }
                    }
                }
            });
        },

        cancelPackageChangesButtonClicked: function(event) {
            event.preventDefault();
            var id = event.data.id;
            var self = this;
            bootbox.dialog({
                message: "Строки с переводами будут заменены на версию последнего сохранения.",
                title: "Отменить внесенные изменения?",
                onEscape: function() {},
                show: true,
                backdrop: true,
                closeButton: true,
                animate: true,
                className: "confirm-cancel-changes-text",
                buttons: {
                        "Отменить": function() {},
                        "Продолжить": {
                                className: "btn-warning",
                                callback: function() {
                                    self.displayPackage(id);
                                }
                        },
                }
            });
        },

        saveTranslationsButtonClicked: function(event) {
            event.preventDefault();
			$form = $(".translationsForm");

            var translationDesktopFiles = this.getTranslationsFromDOM();
            var p = this.getPackageByProjectId($(".jsPackageName").data("project-id"));

            p.desktop_files = translationDesktopFiles;

            var oldStatus = p.status;

            if (p.status === 5) {//возврат от состояния "закоммичен" к "переведены все строки"
                p.status = 4;
            }

            p.status = this.getPackageStatus(p);
            if (oldStatus !== p.status) {
                this.reloadPackagesList(p.project_id);
            }

            this.reloadActivePackageMenu(p);

            this.showPackageSuccessMessage("<strong>Изменения сохранены.</strong>");
		},

        commitPackagePatchButtonClicked: function(event) {
            event.preventDefault();
            var translationDesktopFiles = this.getTranslationsFromDOM();
            var hasEmptyStrings = this.checkEmptyStrings(translationDesktopFiles);

            if (hasEmptyStrings) {
                var self = this;
                bootbox.dialog({
					message: "Локализация добавлена не для всех строк.",
					title: "Продолжить?",
					onEscape: function() {},
					show: true,
					backdrop: true,
					closeButton: true,
					animate: true,
					className: "confirm-commit-patch-text",
					buttons: {
							"Отменить": function() {},
							"<span class=\"glyphicon glyphicon-floppy-disk\"></span> Все-равно сделать коммит": {
									className: "btn-primary",
									callback: function() {
                                        var p = self.getPackageByProjectId($(".jsPackageName").data("project-id"));
                                        console.log(translationDesktopFiles);
                                        p.desktop_files = translationDesktopFiles;
										self.commitPackagePatch(p);
									}
							},
					}
                });
            } else {
                var p = this.getPackageByProjectId($(".jsPackageName").data("project-id"));
                console.log(translationDesktopFiles);
                p.desktop_files = translationDesktopFiles;
                this.commitPackagePatch(p);
            }
        },

        allPackagesCommitPatchesMenuItemClicked:function(event) {
            var self = this;
            bootbox.dialog({
                message: "Будут выполнены коммиты патчей для всех пакетов со статусом \"Локализирован, готов к коммиту\".",
                title: "Выполнить коммиты патчей?",
                onEscape: function() {},
                show: true,
                backdrop: true,
                closeButton: true,
                animate: true,
                className: "confirm-commit-patch-text",
                buttons: {
                        "Отменить": function() {},
                        "<span class=\"glyphicon glyphicon-floppy-disk\"></span> Выполнить коммиты патчей": {
                                className: "btn-primary",
                                callback: function() {
                                    var active_package;
                                    if ($(".jsPackageName") && $(".jsPackageName").data("project-id")) {
                                        active_package = self.getPackageByProjectId($(".jsPackageName").data("project-id"))
                                    }
                                    self.commitAllPackagesPatches(active_package);
                                }
                        },
                }
            });
        },

        allPackagesHideLocalizedMenuItemClicked: function(event) {
            var self = this;
            bootbox.dialog({
                message: "Скрытие удалит из списка пакеты со статусом \"Коммит патча выполнен\".",
                title: "Скрыть локализированные пакеты?",
                onEscape: function() {},
                show: true,
                backdrop: true,
                closeButton: true,
                animate: true,
                className: "confirm-hide-packages-text",
                buttons: {
                        "Отменить": function() {},
                        "<span class=\"glyphicon glyphicon-remove\"></span> Скрыть": {
                        className: "btn-danger",
                        callback: function() {
                            self.packages = $.grep(self.packages, function(p){
                                 return p.status != 5;
                            });
                            self.clearCurrentLocation();
                            self.reloadPackagesList();
                        }
                    }
                }
            });
        },
        /* ====   End of events   ==== */




        /* ====   Main functions   ==== */

        /* import */

        reloadImportControls: function() {
            if (this.importSelectedFiles && this.importSelectedFiles.length) {
                $(".jsFileChooserCount").html(this.importSelectedFiles.length);
            }
            var $importRepoInput = $(".jsImportRepoInput");
            var $importPackagesButton = $(".jsImportPackagesButton");
            if ((this.importSelectedFiles && this.importSelectedFiles.length > 0) ||
                ($importRepoInput && $importRepoInput.val() && $importRepoInput.val().trim().length > 0)) {
                if ($importPackagesButton.hasClass("disabled")) {
                    $importPackagesButton.removeClass("disabled");
                }
            } else {
                if (!($importPackagesButton.hasClass("disabled"))) {
                    $importPackagesButton.addClass("disabled");
                }
            }
        },

        setInitialStatuses: function() {
            var self = this;
			$.each(this.packages, function( p_index, p ) {
                p.status = self.getPackageStatus(p);
			});
        },

        /* package */

		reloadPackagesList: function(active_package_id) {
			var template = $('#packageListItemTempl').html();
			Mustache.parse(template); 
			var obj = {
				"packages": this.packages, 
				"statusText": function(status) {
					switch (this.status + "") {
                        case "0": return "<span class=\"label label-warning\">Статус не определен</span>";
                        case "1": return "<span class=\"label label-default\">Не найдены строки</span>";
						case "2": return "<span class=\"label label-info\">Не локализирован</span>";
						case "3": return "<span class=\"label label-info\">Локализирован частично</span>";
						case "4": return "<span class=\"label label-success\">Локализирован, готов к коммиту</span>";
						case "5": return "<span class=\"label label-primary\">Коммит патча выполнен</span>";
						default: return "<span class=\"label label-warning\">Статус не определен</span>";
					}
				}
			}
			var rendered = Mustache.render(template, obj);
			$('#packages_list_container').html(rendered);

            var $allPackagesCommandsMenuItem = $(".jsAllPackagesCommandsMenuItem")
            if (this.packages && this.packages.length > 0) {
                $allPackagesCommandsMenuItem.removeClass("disabled");
            } else {
                if (!$allPackagesCommandsMenuItem.hasClass("disabled")) {
                    $allPackagesCommandsMenuItem.addClass("disabled");
                }
            }

            if (active_package_id) {
                $('#packages_list_container').find("[data-id=" + active_package_id + "]").addClass("active");
            }

			$(".jsPackagesListItem").on('click', this.packagesListItemClicked.bind(this));
		},

        displayPackage: function(project_id) {
            var p = this.getPackageByProjectId(project_id);

            var template = $('#packageTempl').html();
			Mustache.parse(template);
			var rendered = Mustache.render(template, p);
			$('#workplace_container').html(rendered);

            $(".jsTranslateFieldButton").on('click', this.translateFieldButtonClicked.bind(this));
			$(".jsCancelPackageChangesButton").on('click', {id: project_id}, this.cancelPackageChangesButtonClicked.bind(this));
			$(".jsSaveTranslationsButton").on('click', this.saveTranslationsButtonClicked.bind(this));
			$(".jsCommitPackagePatchButton").on('click', this.commitPackagePatchButtonClicked.bind(this));
            this.reloadActivePackageMenu(p);
        },

        reloadActivePackageMenu: function(active_package) {
            var $addTranslatesMenuItem = $(".jsActivePackageAddMissedTranslatesMenuItem");
            if (this.checkEmptyStrings(active_package.desktop_files)) {
                $addTranslatesMenuItem.removeClass("disabled");
            } else {
                if (!$addTranslatesMenuItem.hasClass("disabled")) {
                    $addTranslatesMenuItem.addClass("disabled");
                }
            }
            $addTranslatesMenuItem.off('click');
            $addTranslatesMenuItem.on('click', {id: active_package.project_id}, this.addActivePackageMissedTranslatesMenuItemClicked.bind(this));
            var $activePackageCommitPatchMenuItem = $(".jsActivePackageCommitPatchMenuItem");
            $activePackageCommitPatchMenuItem.off('click');
            $activePackageCommitPatchMenuItem.on('click', this.commitPackagePatchButtonClicked.bind(this));
            var $activePackageHideMenuItem = $(".jsActivePackageHideMenuItem");
            $activePackageHideMenuItem.off('click');
            $activePackageHideMenuItem.on('click', {id: active_package.project_id}, this.hideActivePackageMenuItemClicked.bind(this));
        },

        translateField: function(targetField, text) {
            try {
                if (!this.useStubs) {
                    var result = JSON.parse(Bridge.get_translation(text));
                } else {
                    var result = {value:"Переведенный текст."};//{error: "Error!"};//
                }
                if(!(result.error && result.error.length > 0)) {
                    targetField.val(result.value);
                } else {
                    console.log("error while translating text: " + result.error);
                    this.showPackageErrorMessage('<strong>' + result.error + '</strong>');
                }
            } catch (e) {
                console.log("error while translating text: " + e);
                this.showPackageErrorMessage("<strong>Ошибка при попытке машинного перевода!</strong> Попробуйте еще раз.");
            }
        },

        getTranslationsFromDOM: function() {
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
							en: $(value).find("#stringEn").html().trim(),
							ru: $(value).find("#stringRu").val().trim()
						}
					};
					stringList.push(str);
				});

				obj.strings = stringList;

				files.push(obj);
			});

            console.log(files);

            return files;
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

        addMissedTranslations: function(projectObj) {
            var self = this;
            $.each(projectObj.desktop_files, function (f_index, file) {
                $.each(file.strings, function (s_index, str) {
                    if (str.value && str.value.en && (!str.value.ru || str.value.ru.trim().length === 0)) {
                        try {
                            if (!self.useStubs) {
                                var result = JSON.parse(Bridge.get_translation(str.value.en));
                            } else {
                                var result = {value:"Переведенный текст."};//{error: "Error!"};//
                            }
                            if(!(result.error && result.error.length > 0)) {
                                str.value.ru = result.value;
                            } else {
                                console.log("error while translating text: " + result.error);
                            }
                        } catch (e) {
                            console.log("error while translating text: " + e);
                        }
                    }
                });
            });
        },

        checkEmptyStrings: function(desktop_files) {
            var res = false;
            $.each(desktop_files, function( index, f ) {
                console.log(f);
                $.each(f.strings, function( index, str ) {
                    if (!(str.value.ru && str.value.ru.trim().length > 0)) {
                        res = true;
                        return false;
                    }
                });
            });
            return res;
        },

        getPackageStatus: function(packageObj) {
            /* statuses: 0 - статус не определен, 1 - не найдены строки для локализации, 2 - не локализирован, 3 - локализирован частично, 4 - локализирован, готов к коммиту, 5 - коммит патча выполнен. */
            if (!(packageObj.status && packageObj.status + "" === "5")) {
                var totalCount = 0;
                var translatedCount = 0;
                $.each(packageObj.desktop_files, function (f_index, file) {
                    $.each(file.strings, function (s_index, str) {
                        totalCount++;
                        if (str.value && str.value.ru && str.value.ru.trim().length > 0) {
                            translatedCount++;
                        }
                    });
                });
                if (totalCount === 0) return 1;
                if (translatedCount === 0) return 2;
                if (totalCount > translatedCount) return 3;
                if (totalCount === translatedCount) return 4;
                return 0;
            } else {
                return 5;
            }
        },

        commitPackagePatch: function(packageObj) {
            var data = {
                git: packageObj.git,
                desktop_files: packageObj.desktop_files
            };

            try {
                if (!this.useStubs) {
                    var result = JSON.parse(Bridge.commit_translations_patch(JSON.stringify(data)));
                } else {
                    var result = {};//{error: "Error!"};
                }
                if(!(result.error && result.error.length > 0)) {
                    this.showPackageSuccessMessage("<strong>Коммит выполнен.</strong>");
                    packageObj.status = 5;
                    this.reloadPackagesList(packageObj.project_id);
                    this.reloadActivePackageMenu(packageObj);
                } else {
                    console.log("error while committing translations: " + result.error);
                    this.showPackageErrorMessage('<strong>' + result.error + '</strong>');
                }
            } catch (e) {
                console.log("error while committing translations: " + e);
                this.showPackageErrorMessage("<strong>Ошибка при попытке коммита!</strong> Попробуйте еще раз.");
            }
        },

        commitAllPackagesPatches: function(active_package) {
            var success = 0;
            var error = 0;
            var self = this;
            $.each(this.packages, function( index, packageObj ) {
                if (packageObj.status === 4) {
                    console.log("commit for " + packageObj.package_name);

                    var data = {
                        git: packageObj.git,
                        desktop_files: packageObj.desktop_files
                    };

                    try {
                        if (!self.useStubs) {
                            var result = JSON.parse(Bridge.commit_translations_patch(JSON.stringify(data)));
                        } else {
                            var result = {};//{error: "Error!"};
                        }
                        if(!(result.error && result.error.length > 0)) {
                            success++;
                            packageObj.status = 5;

                        } else {
                            console.log("error while committing translations: " + result.error);
                            error++;
                        }
                    } catch (e) {
                        console.log("error while committing translations: " + e);
                        error++;
                    }
                }
            });
            this.reloadPackagesList((active_package) ? active_package.project_id : undefined);
            if (active_package) {
                this.reloadActivePackageMenu(active_package);
            }
        },

        /* ====   End of main functions   ==== */




        /* ====   Alerts and popups  ==== */

        /* import */

        showImportErrorMessage: function(error) {
            $(".errorImportText").html('<span class="glyphicon glyphicon-alert"></span> ' + error);
            $(".errorImportContainer").show();
            $('.right_block').scrollTop(0);
        },

        showImportSuccessMessage: function(text) {
            $(".successImportText").html('<span class="glyphicon glyphicon-ok"></span> ' + text);
            $(".successImportContainer").show();
            $('.right_block').scrollTop(0);
        },

        hideImportMessageContainers: function() {
            $(".errorImportContainer").hide();
            $(".successImportContainer").hide();
        },

        initPopoverForImportHelp: function() {
            $('.popover').remove();
            $(".jsShowImportCustomTypeHelpButton").popover({
                placement: "right auto",
                trigger: "manual",
                html: true,
                container: 'body',
                content: function() {
                    var template = $('#importCustomTypeHelpTempl').html();
                    Mustache.parse(template);
                    return Mustache.render(template, {});
                }
            });
            $(window).off('resize');
            $(window).on('resize', function() {
                var $showImportCustomHelpButton = $('.jsShowImportCustomTypeHelpButton');
                if($showImportCustomHelpButton.data('bs.popover').tip().hasClass('in') == true) {
                    $showImportCustomHelpButton.popover('show');
                }
            });
            $('body').on('click', function (e) {
                if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
                    $('[data-toggle="popover"]').popover('hide');
                }
            });
        },

        /* settings */

        hideBrunchErrors: function() {
			$(".errorAddBrunchContainer").hide();
			$(".errorBrunchContainer").hide();
		},

        showSettingsErrorMessage: function(error) {
            $(".errorSettingsText").html('<span class="glyphicon glyphicon-alert"></span> ' + error);
            $(".errorSettingsContainer").show();
            $('.right_block').scrollTop(0);
        },

        showSettingsSuccessMessage: function(text) {
            $(".successSettingsText").html('<span class="glyphicon glyphicon-saved"></span> ' + text);
            $(".successSettingsContainer").show();
            $('.right_block').scrollTop(0);
        },

		hideSettingsMessageContainers: function() {
			$(".errorSettingsContainer").hide();
			$(".successSettingsContainer").hide();
		},

        /* package */

        showPackageErrorMessage: function(error) {
            $(".errorPackageText").html('<span class="glyphicon glyphicon-alert"></span> ' + error);
            $(".errorPackageContainer").show();
            $('.right_block').scrollTop(0);
        },

        showPackageSuccessMessage: function(text) {
            $(".successPackageText").html('<span class="glyphicon glyphicon-ok"></span> ' + text);
            $(".successPackageContainer").show();
            $('.right_block').scrollTop(0);
        }

        /* ====   End of alerts and popups  ==== */
	};
	
	App.init();
	
});
















