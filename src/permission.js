// 取到需要权限判断的路由表
import { permissionRouter, fixedRouter } from '@/router'
import router from '@/router'
import notpage from '@/views/example/404'
var addRouFlag = false

router.beforeEach((to, from, next) => {
    // 取到用户的角色
    let GetRole = localStorage.getItem("userRole")

    // 如果登录了
    if (GetRole && GetRole !== 'unload') {
        next() //next()方法后的代码也会执行
            // 1.如果路由表 没根据角色进行筛选,就筛选一次
        if (!addRouFlag) {
            addRouFlag = true
                // 2.根据用户的角色、和需要动态展示的路由，生成符合用户角色的路由
            var getRoutes = baseRoleGetRouters(permissionRouter, GetRole.split(","))
                //404页面
            getRoutes.push({
                    path: "*",
                    component: notpage,
                    name: '404',
                    meta: {
                        icon: 'el-icon-mobile-phone',
                        title: 'false'
                    }
                })
                // 3.利用global属性，让渲染菜单的组件sideMeuns.vue重新生成左侧菜单
            global.antRouter = fixedRouter.concat(getRoutes)
                // 4.将生成好的路由addRoutes
            router.addRoutes(fixedRouter.concat(getRoutes))
                // 5.push之后，会重新进入到beforeEach的钩子里,直接进入第一个if判断
            router.push({ path: to.path })
        }
    } else {
        // 用户没登录，跳转到登录页面
        if (to.path === '/') {
            next()
        } else {
            next('/')
        }
    }

})


function hasPermission(route, roles) {
    if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.indexOf(role) >= 0)
    } else {
        return true
    }
}
// 根据用户的角色取到该用户对应的路由
function baseRoleGetRouters(allRoutes, roles) {
    // allRoutes是动态路由表
    // roles是取到的用户角色，数组
    // 根据权限  有对应权限时选出addrouter中正确的权限中

    let rightRoutes = allRoutes.filter((route, index) => {
        if (hasPermission(route, roles)) {
            if (route.children && route.children.length) {
                route.children = baseRoleGetRouters(route.children, roles)
            }
            return true
        }
        return false
    })
    return rightRoutes
}