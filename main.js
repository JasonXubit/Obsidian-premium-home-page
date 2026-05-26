const obsidian = require("obsidian");

const VIEW_TYPE = "premium-home-dashboard";

const DEFAULT_SETTINGS = {
    pagePaddingY: 48,
    pagePaddingX: 48,
    showOnStartup: false,
    fontFamily: ""
};



class PremiumHomeSettingTab extends obsidian.PluginSettingTab {

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {

        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl(
            "h2",
            { text: "Knowledge OS 设置" }
        );



        // 上下边距

        new obsidian.Setting(containerEl)

            .setName("上下页边距")

            .setDesc("页面顶部与底部留白(px)")

            .addText(text =>

                text

                    .setPlaceholder("48")

                    .setValue(
                        this.plugin.settings.pagePaddingY.toString()
                    )

                    .onChange(async value => {

                        const num = parseInt(value);

                        this.plugin.settings.pagePaddingY =
                            isNaN(num)
                                ? 48
                                : Math.max(0, num);

                        await this.plugin.saveSettings();

                        this.plugin.applySettings();

                    })

            );




        // 左右边距

        new obsidian.Setting(containerEl)

            .setName("左右页边距")

            .setDesc("页面左右留白(px)")

            .addText(text =>

                text

                    .setPlaceholder("48")

                    .setValue(
                        this.plugin.settings.pagePaddingX.toString()
                    )

                    .onChange(async value => {

                        const num = parseInt(value);

                        this.plugin.settings.pagePaddingX =
                            isNaN(num)
                                ? 48
                                : Math.max(0, num);

                        await this.plugin.saveSettings();

                        this.plugin.applySettings();

                    })

            );




        // 启动显示

        new obsidian.Setting(containerEl)

            .setName("启动时显示")

            .setDesc("启动 Obsidian 自动打开仪表盘")

            .addToggle(toggle =>

                toggle

                    .setValue(
                        this.plugin.settings.showOnStartup
                    )

                    .onChange(async value => {

                        this.plugin.settings.showOnStartup =
                            value;

                        await this.plugin.saveSettings();

                    })

            );




        // 字体

        new obsidian.Setting(containerEl)

            .setName("自定义字体")

            .setDesc(
                "输入字体名称，例如：MiSans、Maple Mono"
            )

            .addText(text =>

                text

                    .setPlaceholder(
                        "默认字体"
                    )

                    .setValue(
                        this.plugin.settings.fontFamily || ""
                    )

                    .onChange(async value => {

                        this.plugin.settings.fontFamily =
                            value.trim();

                        await this.plugin.saveSettings();

                        this.plugin.applySettings();

                    })

            );

    }

}





class PremiumHomeView extends obsidian.ItemView {

    constructor(leaf, plugin) {

        super(leaf);

        this.plugin = plugin;

    }


    getViewType() {

        return VIEW_TYPE;

    }


    getDisplayText() {

        return "Knowledge OS";

    }


    getIcon() {

        return "layout-dashboard";

    }



    async onOpen() {

        const container =
            this.contentEl;

        container.empty();

        container.addClass(
            "ph-root"
        );


        const wrapper =
            container.createDiv({
                cls: "ph-wrapper"
            });



        const root =
            this.app.vault.getRoot();


        const markdownFiles =
            this.app.vault.getMarkdownFiles();




        const folders =

            root.children

                .filter(

                    item =>

                        item instanceof
                        obsidian.TFolder

                )

                .sort(
                    (a, b) => {

                        const aTime =
                            Math.max(
                                0,
                                ...markdownFiles
                                    .filter(
                                        f =>
                                            f.path.startsWith(
                                                a.path + "/"
                                            )
                                    )
                                    .map(
                                        f => f.stat.mtime
                                    )
                            );


                        const bTime =
                            Math.max(
                                0,
                                ...markdownFiles
                                    .filter(
                                        f =>
                                            f.path.startsWith(
                                                b.path + "/"
                                            )
                                    )
                                    .map(
                                        f => f.stat.mtime
                                    )
                            );

                        return bTime - aTime;

                    }
                );



        let currentProject =
            folders[0] || null;




        const header =
            wrapper.createDiv({
                cls: "ph-header"
            });


        const titleArea =
            header.createDiv();


        titleArea.createEl(
            "h1",
            {
                text:
                    "Knowledge OS"
            }
        );



        const stats =
            header.createDiv({
                cls: "ph-stats"
            });


        createStat(
            stats,
            folders.length,
            "项目"
        );


        createStat(
            stats,
            markdownFiles.length,
            "笔记"
        );




        wrapper.createEl(
            "h3",
            {
                text:
                    "最近编辑"
            }
        );


        const recent =
            wrapper.createDiv({
                cls:
                    "recent-container"
            });



        markdownFiles

            .sort(
                (a, b) =>
                    b.stat.mtime -
                    a.stat.mtime
            )

            .slice(0, 5)

            .forEach(file => {

                const card =

                    recent.createDiv({

                        cls:
                            "recent-card",

                        text:
                            file.basename

                    });


                card.onclick =
                    () => {

                        this.app.workspace
                            .getLeaf(true)
                            .openFile(file);

                    };

            });




        const layout =
            wrapper.createDiv({
                cls:
                    "ph-layout"
            });


        const left =
            layout.createDiv({
                cls:
                    "ph-sidebar"
            });


        const right =
            layout.createDiv({
                cls:
                    "ph-content"
            });



        const search =
            left.createEl(
                "input",
                {
                    type: "text",
                    placeholder:
                        "搜索项目..."
                }
            );


        search.className =
            "ph-search";



        const projectList =
            left.createDiv({
                cls:
                    "project-list"
            });




        function renderProjectList(
            keyword = ""
        ) {

            projectList.empty();


            folders

                .filter(

                    folder =>

                        folder.name

                            .toLowerCase()

                            .includes(

                                keyword.toLowerCase()

                            )

                )

                .forEach(folder => {

                    const item =

                        projectList.createDiv({

                            cls:

                                "project-item" +

                                (
                                    folder === currentProject

                                        ? " active"
                                        : ""
                                ),

                            text:
                                folder.name

                        });


                    item.onclick =
                        () => {

                            currentProject =
                                folder;

                            renderProjectList(
                                search.value
                            );

                            renderContent();

                        };

                });

        }



        const renderContent =
            () => {

                right.empty();

                if (!currentProject)
                    return;


                const notes =

                    markdownFiles

                        .filter(

                            f =>

                                f.path.startsWith(
                                    currentProject.path + "/"
                                )

                        )

                        .sort(
                            (a, b) =>
                                b.stat.mtime -
                                a.stat.mtime
                        );



                const topBar=

				right.createDiv({

				cls:
				"content-header"

				});



				topBar.createEl(
				"h2",
				{
				text:
				currentProject.name
				}
				);



				const addButton=

				topBar.createEl(

				"button",

				{

				text:"+"

				}

				);


				addButton.className=
				"new-note-btn";



				addButton.onclick=

				async()=>{


				let baseName=
				"未命名笔记";

				let name=
				baseName;

				let index=1;



				while(

				this.app.vault
				.getAbstractFileByPath(

				`${currentProject.path}/${name}.md`

				)

				){

				name=

				`${baseName} ${index}`;

				index++;

				}



				const file=

				await this.app.vault
				.create(

				`${currentProject.path}/${name}.md`,

				""

				);



				await this.app.workspace

				.getLeaf(true)

				.openFile(
				file
				);



				// 刷新当前仪表盘

				this.onOpen();

				};



				right.createEl(
				"p",
				{
				text:
				notes.length+
				" 个笔记"
				}
				);



                const noteList =
                    right.createDiv({
                        cls:
                            "note-list"
                    });



                notes.forEach(note => {

                    const item =

                        noteList.createDiv({

                            cls:
                                "note-item",

                            text:
                                note.basename

                        });


                    item.onclick =
                        () => {

                            this.app.workspace
                                .getLeaf(true)
                                .openFile(note);

                        };

                });

            };



        function createStat(
            parent,
            value,
            title
        ) {

            const card =

                parent.createDiv({
                    cls:
                        "stat-card"
                });


            card.createEl(
                "h3",
                {
                    text:
                        value.toString()
                }
            );


            card.createEl(
                "span",
                {
                    text:
                        title
                }
            );

        }



        search.addEventListener(
            "input",
            () => {

                renderProjectList(
                    search.value
                );

            }
        );


        renderProjectList();

        renderContent();

    }

}




module.exports =
class PremiumProjectHome
extends obsidian.Plugin {

    async onload() {

        await this.loadSettings();

        this.applySettings();

        this.registerView(

            VIEW_TYPE,

            leaf =>
                new PremiumHomeView(
                    leaf,
                    this
                )

        );


        this.addSettingTab(

            new PremiumHomeSettingTab(
                this.app,
                this
            )

        );


        this.addRibbonIcon(

            "layout-dashboard",

            "Knowledge OS",

            () => {

                this.activateView();

            }

        );



        this.addCommand({

            id:
                "open-dashboard",

            name:
                "Open Knowledge OS",

            callback:
                () => {

                    this.activateView();

                }

        });



        this.app.workspace
            .onLayoutReady(
                () => {

                    if (
                        this.settings.showOnStartup
                    ) {

                        this.activateView();

                    }

                }
            );

    }



    async activateView() {

        let leaf =

            this.app.workspace
                .getLeavesOfType(
                    VIEW_TYPE
                )[0];


        if (!leaf) {

            leaf =

                this.app.workspace
                    .getLeaf(true);

            await leaf
                .setViewState({

                    type:
                        VIEW_TYPE,

                    active: true

                });

        }

    }



    applySettings() {

        document.documentElement
            .style.setProperty(
                "--ph-padding-y",
                this.settings.pagePaddingY + "px"
            );


        document.documentElement
            .style.setProperty(
                "--ph-padding-x",
                this.settings.pagePaddingX + "px"
            );


        const font =
            (this.settings.fontFamily || "")
                .trim();


        document.documentElement
            .style.setProperty(
                "--ph-font-family",

                font !== ""
                    ? `"${font}"`
                    : "inherit"
            );

    }



    async loadSettings() {

        this.settings =

            Object.assign(

                {},

                DEFAULT_SETTINGS,

                await this.loadData() || {}

            );

    }



    async saveSettings() {

        await this.saveData(
            this.settings
        );

    }

}