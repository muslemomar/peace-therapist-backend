<template>

  <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

    <!-- Sidebar - Brand -->
    <router-link class="sidebar-brand d-flex align-items-center justify-content-center" @click="setActive('Dashboard')"
                 :to="{name: 'Dashboard'}">

      <div class="sidebar-brand-icon">
        <img src="/static/images/logo.png" class="sidebar-logo"/>
      </div>

      <div class="sidebar-brand-text mx-2">{{appName}}</div>

    </router-link>

    <div>
      <!-- Divider -->
      <hr class="sidebar-divider my-0">

      <!-- Nav Item - Dashboard -->

      <li class="nav-item" @click="setActive('Dashboard')" :class="{active: isActive('Dashboard')}">
        <router-link :to="{name: 'Dashboard'}" class="nav-link">
          <i class="fas fa-fw fa-tachometer-alt"></i>
          <span>{{getStr('dashboard_title')}}</span>
        </router-link>
      </li>

    </div>

    <!-- Heading -->
    <div class="sidebar-heading">
      Data
    </div>

    <!-- Nav Item - Tables -->
    <li class="nav-item" v-for="(section,index) of sections"
        :key="index" :class="{active: isActive(section.name)}">
      <a class="nav-link collapsed" data-toggle="collapse" :data-target="'#collapseTwo' + index" aria-expanded="true"
         :aria-controls="'collapseTwo' + index" href="#">
        <i class="fas fa-fw" :class="section.icon"></i>
        <span>{{section.name}}</span>
      </a>

      <div :id="'collapseTwo' + index" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
        <div class="bg-white py-2 collapse-inner rounded">

          <div v-for="(nestedLabel,nestedLabelIndex) of section.nestedLabels" :key="nestedLabelIndex">
            <h6 class="collapse-header">{{nestedLabel.name}}:</h6>
            <span v-for="(nestedElem,nestedElemIndex) of nestedLabel.sections" :key="nestedElemIndex"
                  @click="setActive(nestedElem.name)"><router-link class="collapse-item"
                                                                   :class="{active: isActive(nestedElem.name)}"
                                                                   :to="{name: nestedElem.name}">{{nestedElem.label}}</router-link></span>
          </div>

        </div>
      </div>


    </li>

    <!-- Divider -->
    <hr class="sidebar-divider d-none d-md-block">

    <!-- Sidebar Toggler (Sidebar) -->
    <div class="text-center d-none d-md-inline">
      <button class="rounded-circle border-0" id="sidebarToggle"></button>
    </div>

  </ul>

</template>

<script>

    export default {
        name: "Sidebar",
        data() {
            return {
                activeItem: 'Dashboard',
                sections: [
                    {
                        name: 'Doctors',
                        icon: 'fa-user-md',
                        nestedLabels: [
                            {
                                name: 'Doctors',
                                sections: [
                                    {
                                        label: 'Doctors Table',
                                        name: 'Doctors'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'NGOs',
                        icon: 'fa-globe',
                        nestedLabels: [
                            {
                                name: 'NGOs',
                                sections: [
                                    {
                                        label: 'NGOs Table',
                                        name: 'NGOs'
                                    },
                                    {
                                        label: "Create NGO",
                                        name: 'AddNGO'
                                    }
                                ]
                            }
                        ]
                    },
                ],
            };
        },
        created() {
        },
        methods: {
            setActive(link) {
                this.activeItem = link;
            },
            isActive(item) {
                if (!Array.isArray(item)) {
                    item = [item];
                }

                return item.some(i => this.activeItem === i);
            },
            setDefaultActivePage(page, params) {
                this.activeItem = page;
                this.$router.push({name: page, params});
            }
        }
    }


</script>

<style>

</style>
