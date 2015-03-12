angular.module 'tab_nav'

.directive 'tabNav', ['$q', ($q) ->
    scope: true
    controller: ['$scope', '$element', '$attrs', '$transclude', tabNavController]
    controllerAs: 'tabNav'
]
.directive 'tabNavTab', ['$q', ($q) ->
    require: '^^tabNav'
    scope: {title: '=?'}
    link: ($scope, $element, $attrs, tabNav) ->
        tabNav.registerTab($scope)
        if not $attrs.default?
            $element.hide()
        $scope.$on 'tabActivated', (evt, args) ->
            console.log 'tabber', args.tabber
            if args.tab == $scope and args.tabber == tabNav
                $element.show()
                console.log 'showing', $scope.title
            else if args.tabber == tabNav
                $element.hide()
                console.log 'hiding', $scope.title
]

tabNavController = ($scope, $element, $attrs, $transclude) ->
    console.log 'Instantiate'
    this.tabs = []
    this.activeTab = null
    this.activeTabIndex = -1
    this.broadcast = (tab) -> $scope.$broadcast 'tabActivated', tab
tabNavController.prototype.registerTab = (tab) ->
    console.log 'register', tab.title
    this.tabs.push(tab)
tabNavController.prototype.unregisterTab = (tab) ->
    this.tabs.splice(this.tabs.indexOf(tab), 1)
tabNavController.prototype.activateTab = (tab) ->
    this.activeTab = tab
    this.activeTabIndex = this.tabs.indexOf(tab)
    this.broadcast({tab: tab, tabber: this})
    console.log 'activated', tab.title
    
