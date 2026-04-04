<script setup>
import { ref } from 'vue';
import { onMounted, onUpdated, onUnmounted } from 'vue';
import AOS from 'aos';
import { RouterLink } from 'vue-router';

const endpoint = "https://cms.jaldi.app/"

const showMobileMenu = ref(false);
const activeSection = ref(''); // Track the active section
const posts = ref([]);
const loading = ref(true);
const error = ref(null);

function addProtocolToUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url; // or 'http://' based on your preference
    }
    return url;
  }

function showMenu() {
	showMobileMenu.value = !showMobileMenu.value;
}
const close = () => {
	showMobileMenu.value = false
}
function scrollToSection(id) {
	const section = document.getElementById(id);
	if (section) {
		section.scrollIntoView({ behavior: 'smooth' });
	}
}
function setActiveSection(title) {
	this.activeSection = title; // Update the active section on click
}
function handleScroll() {
	const sections = document.querySelectorAll('section');
	let currentSection = '';
	sections.forEach((section) => {
		const sectionTop = section.offsetTop;
		if (window.scrollY >= sectionTop - 10) {
			currentSection = section.getAttribute('id');
		}
	});

	activeSection.value = currentSection;
}
// Function to fetch posts

const landingPageApi = async () => {
	try {
		const response = await fetch(`${endpoint}api/v1/collections/pages/entries`);
		console.log(response)
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		posts.value = await response.json();
	} catch (err) {
		error.value = err.message;
	} finally {
		loading.value = false;
	}
};
const isSticky = ref(false);


const handleScrollnav = () => {
	// Toggle the 'sticky' class when scroll position passes 50px
	isSticky.value = window.scrollY > 50;
};

onMounted(() => {
	AOS.init();
	window.addEventListener('scroll', handleScroll);
	window.addEventListener('scroll', handleScrollnav);

	landingPageApi()
});
onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
	window.removeEventListener('scroll', handleScrollnav);
});


</script>
<template>
	<!-- Warp Div -->
	<div class="wrap">
		<div class="bg-white w-full relative">
			<nav class="bg-white border-gray-200 dark:bg-gray-900  mx-auto  "
				:class="{ 'fixed w-full z-[999] shadow-md': isSticky }">
				<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4 px-4">
					<a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
						<img src="../../assets/images/landing-page/jaldi-logo.png" class="h-6" alt="juldi Logo" />
					</a>
					<div class="flex items-center gap-1 md:gap-4 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <router-link
                to="/login"
                class="text-black border-2 border-[#F96F01] focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-3 md:px-4 py-2 md:py-2 text-center">
              Sign in
            </router-link>
						<!-- <a href="#"
							class="text-white bg-[#F96F01] font-medium rounded-lg text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5 text-center">
							Create
							an account</a> -->

						<button data-collapse-toggle="navbar-cta" type="button" @click="showMenu()"
							class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
							aria-controls="navbar-cta" aria-expanded="false">
							<span class="sr-only">Open main menu</span>
							<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
								viewBox="0 0 17 14">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M1 1h15M1 7h15M1 13h15" />
							</svg>
						</button>
					</div>

					<div class="items-center justify-between w-full md:flex md:w-auto md:order-1 relative z-30"
						:class="showMobileMenu ? 'block' : 'hidden'" id="navbar-cta">
						<ul v-if="posts.menu"
							class="flex flex-col font-medium p-4 md:p-0   border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 absolute top-2 w-full md:static">
							<li v-for="nav in posts.menu" :key="nav.title">
								<a :href="`#${nav.title}`" @click.prevent="scrollToSection(nav.title)"
									@click="close"
									:class="{ 'md:border-b-2 md:border-[#F96F01]': activeSection === nav.title }"
									class="block pb-2 md:pb-1 text-black font-medium text-base" aria-current="page">
									{{ nav.title }}
								</a>
							</li> 
						</ul>
						<ul v-else
							class="flex flex-col font-medium p-4 md:p-0 animate-pulse  border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 absolute top-2 w-full md:static">

							<li>
								<a href="#" class="block pb-2 md:pb-1 h-3 w-14 bg-slate-200 rounded font-medium text-base"
									aria-current="page"> </a>
							</li>
							<li>
								<a href="#" class="block pb-2 md:pb-1 h-3 w-14 bg-slate-200 rounded font-medium text-base"
									aria-current="page"> </a>
							</li>
							<li>
								<a href="#" class="block pb-2 md:pb-1 h-3 w-14 bg-slate-200 rounded font-medium text-base"
									aria-current="page"> </a>
							</li>
							<li>
								<a href="#" class="block pb-2 md:pb-1 h-3 w-14 bg-slate-200 rounded font-medium text-base"
									aria-current="page"> </a>
							</li>
							<li>
								<a href="#" class="block pb-2 md:pb-1 h-3 w-14 bg-slate-200 rounded font-medium text-base"
									aria-current="page"> </a>
							</li>
						</ul>
					</div> 
				</div>
			</nav> 
		</div> 
		<!-- Container -->
		<div class="max-w-screen-xl mx-auto px-4 mb-10 relative" id="Home"> 
			<!-- Main Banner --> 
			<div v-if="posts.data" :style="{ backgroundImage: `url(${endpoint}assets/${posts.data[0].section1.banner})` }"
				class="main-banner  bg-no-repeat bg-cover bg-center mb-16">
				<div class="py-[60px] md:py-[100px] w-full lg:w-[600px] px-6 md:px-14">
					<h1 class="text-4xl font-bold text-black mb-1.5" data-aos="fade-up" data-aos-delay="400">
						{{ posts.data[0].section1.title }}</h1>
					<h4 class="text-lg xl:text-2xl font-medium text-black mb-4" data-aos="fade-up" data-aos-delay="450"
						v-html="posts.data[0].section1.subtitle"> </h4>
					<p class="text-sm  text-black" data-aos="fade-up" data-aos-delay="500">{{ posts.data[0].section1.description
						}}
					</p>
					<div class="flex gap-4 md:gap-6 mt-8">
						<a href="#" data-aos="fade-up" data-aos-delay="600"
							class="text-black border-2 border-[#F96F01] bg-white focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm xl:text-base px-6 xl:px-8 py-2 xl:py-2.5 text-center">
							{{ posts.data[0].section1.home_button_1 }}
						</a>
						<a href="#" data-aos="fade-up" data-aos-delay="650"
							class="text-white bg-[#F96F01] font-medium rounded-lg text-sm xl:text-base px-8 xl:px-10 py-2.5 xl:pt-[11px] text-center">
							{{ posts.data[0].section1.home_button_2 }}
						</a>
					</div>
				</div>
			</div>
			<div v-else class="w-full rounded-xl h-[500px] animate-pulse  bg-slate-200 mb-16"></div>
			<!-- Inventory Section -->

			<div v-if="posts.data" class="inventory-section mb-6">
				<div class="md:flex items-center">
					<div class="w-full md:w-[30%] my-4">
						<div class="image-invent z-50" data-aos="fade-zoom-in" data-aos-delay="100">
							<img class="" :src="`${endpoint}assets/${posts.data[0].section2.banner}`" alt="">
						</div>
					</div>
					<div class="w-full md:w-[70%]">
						<div class="box-cborder box-cborder-h relative rounded-lg lg:-ml-2 z-[-1]">
							<div class="py-8 md:py-14 xl:py-16 px-14 md:px-16 lg:px-20 xl:px-24">
								<h2 class="text-2xl font-bold pb-4 text-black" data-aos="fade-up" data-aos-delay="500"
									v-html="posts.data[0].section2.title">
								</h2>
								<p class="text-sm text-black" data-aos="fade-up" data-aos-delay="550">{{
									posts.data[0].section2.description }}</p>
								<span class="absolute top-2 right-2">
									<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-6">
								</span>
							</div>
						</div>

					</div>
				</div>
			</div>
			<div v-else>
				<div class="mb-16 md:flex items-center">
					<div class="w-full md:w-[30%] my-4 z-50">
						<div class="w-full rounded-xl h-[350px] animate-pulse bg-slate-200"></div>
					</div>
					<div class="w-full md:w-[70%]">
						<div class="border-2 animate-pulse rounded-xl  border-slate-200 lg:-ml-2 z-[-1]">
							<div class="py-8 md:py-14 xl:py-20 px-14 md:px-16 lg:px-20 xl:px-24">
								<div class="w-full rounded-xl h-3 animate-pulse bg-slate-200 mb-4"></div>
								<div class="w-[300px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[250px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[150px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="mb-16 md:flex items-center">
					<div class="w-full md:w-[70%]">
						<div class="border-2 animate-pulse rounded-xl  border-slate-200 lg:-ml-2 z-[-1]">
							<div class="py-8 md:py-14 xl:py-20 px-14 md:px-16 lg:px-20 xl:px-24">
								<div class="w-full rounded-xl h-3 animate-pulse bg-slate-200 mb-4"></div>
								<div class="w-[300px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[250px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[150px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
							</div>
						</div>
					</div>
					<div class="w-full md:w-[30%] my-4 z-50">
						<div class="w-full rounded-xl h-[350px] animate-pulse bg-slate-200"></div>
					</div>
				</div>
				<div class="mb-16 md:flex items-center">
					<div class="w-full md:w-[30%] my-4 z-50">
						<div class="w-full rounded-xl h-[350px] animate-pulse bg-slate-200"></div>
					</div>
					<div class="w-full md:w-[70%]">
						<div class="border-2 animate-pulse rounded-xl  border-slate-200 lg:-ml-2 z-[-1]">
							<div class="py-8 md:py-14 xl:py-20 px-14 md:px-16 lg:px-20 xl:px-24">
								<div class="w-full rounded-xl h-3 animate-pulse bg-slate-200 mb-4"></div>
								<div class="w-[300px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[250px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
								<div class="w-[150px] rounded-xl h-3 animate-pulse bg-slate-200 mb-2"></div>
							</div>
						</div>
					</div>
				</div>

			</div>
			<!-- About Us --> 
			<div v-if="posts.data">
				<section v-if="posts.data[0].section3[0].type === 'maine_headings' && posts.data[0].section3[0].enabled"
					id="About" class="pt-10">
					<div class="manage-wrap mb-16">
						<div class="pb-14">
							<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal">
								{{ posts.data[0].section3[0].tiny_title }}
							</span>
							<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"
								v-html="posts.data[0].section3[0].title">

							</h2>
							<p class="text-black text-base" data-aos="fade-up" data-aos-delay="500">
								{{ posts.data[0].section3[0].description }}
							</p>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
							<!-- Check if there are any items in section3 that have type 'tabs' and are enabled -->
							<div v-for="(item, index) in posts.data[0].section3.filter(i => i.type === 'tabs' && i.enabled)"
								:key="item.id" class="border border-gray-400 rounded-md relative" :data-aos-delay="500 + (index * 50)">
								<span
									class="absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
									<img :src="`${endpoint}assets/${item.icon[0]}`" alt="" class="w-4">
								</span>
								<div class="content-inner pt-8 pb-7 px-5">
									<h4 class="text-xl font-semibold mb-3 text-black">{{ item.title }}</h4>
									<p class="text-sm text-[#373737]">{{ item.description }}</p>
								</div>
							</div>
						</div>
					</div>
					<div class="inventory-section mb-6"
						v-if="posts.data[0].section4[0].type === 'maine_headings' && posts.data[0].section4[0].enabled">
						<div class="md:flex items-center">
							<div class="w-full md:w-[70%]">
								<div class="box-cborder box-cborder-h relative rounded-md -mr-2 z-[-1]">
									<div class="p-10 md:p-14 xl:p-16">
										<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
											data-aos-delay="500">{{ posts.data[0].section4[0].tiny_title }}</span>
										<h2 class="text-2xl font-bold pb-4 mt-4 text-black" data-aos="fade-up" data-aos-delay="500"
											v-html="posts.data[0].section4[0].title">

										</h2>
										<p class="text-sm text-black" data-aos="fade-up" data-aos-delay="500">
											{{ posts.data[0].section4[0].description }}
										</p>
										<ul class="mt-6" data-aos="fade-up" data-aos-delay="500">
											<li class="flex items-center gap-4 mb-2" v-for="(item, index) in posts.data[0].section4[0].lists"
												:key="index">
												<img src="../../assets/images/landing-page/check-filled-icon.svg" alt="">
												<p class="text-sm font-medium text-black">{{ item }}</p>
											</li>
										</ul>
										<span class="absolute top-2 left-2">
											<img src="../../assets/images/landing-page/circle-icon-big.svg" alt="" class="w-6">
										</span>
									</div>
								</div>

							</div>
							<div class="w-full md:w-[30%] my-4">
								<div class="image-invent z-50" data-aos="fade-zoom-in" data-aos-delay="100">
									<img class="" :src="`${endpoint}assets/${posts.data[0].section4[0].banner}`" alt="">
								</div>
							</div>

						</div>
					</div>
				</section>
			</div>
			<!-- Feature -->
			<section id="Features" class="pt-10" v-if="posts.data">

				<div class="manage-wrap mb-16"
					v-if="posts.data[0].section5[0].type === 'maine_headings' && posts.data[0].section5[0].enabled">
					<div class="pb-14">
						<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
							data-aos-delay="500">{{ posts.data[0].section5[0].tiny_title }}</span>
						<!-- <h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"><span
								class="text-[#F96F01] font-bold">Discover</span> Our
							Awesome Features</h2> -->
						<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"
							v-html="posts.data[0].section5[0].title">

						</h2>
						<p class="text-black text-base pr-10" data-aos="fade-up" data-aos-delay="500">
							{{ posts.data[0].section5[0].description }}
						</p>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="500">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img :src="`${endpoint}assets/${posts.data[0].section5[1].banner}`" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">{{ posts.data[0].section5[1].title }}</h4>
								<p class="text-sm text-[#373737]">{{ posts.data[0].section5[1].description }}</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="550">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img :src="`${endpoint}assets/${posts.data[0].section5[2].icon[0]}`" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">{{ posts.data[0].section5[2].title }}</h4>
								<p class="text-sm text-[#373737]">{{ posts.data[0].section5[2].description }}</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="600">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img :src="`${endpoint}assets/${posts.data[0].section5[3].icon[0]}`" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">{{ posts.data[0].section5[3].title }}</h4>
								<p class="text-sm text-[#373737]">{{ posts.data[0].section5[3].description }}</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="650">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img :src="`${endpoint}assets/${posts.data[0].section5[4].icon[0]}`" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">{{ posts.data[0].section5[4].title }}</h4>
								<p class="text-sm text-[#373737]">{{ posts.data[0].section5[4].description }}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="inventory-section mb-16"
					v-if="posts.data[0].section6[0].type === 'new_set' && posts.data[0].section6[0].enabled">
					<div class="md:flex items-center">
						<div class="w-full md:w-[30%] my-4">
							<div class="image-invent z-50" data-aos="fade-zoom-in" data-aos-delay="100">
								<img class="" :src="`${endpoint}assets/${posts.data[0].section6[0].banner}`" alt="">
							</div>
						</div>
						<div class="w-full md:w-[70%]">
							<div class="box-cborder box-cborder-h relative rounded-md -ml-2 z-[-1]">
								<div class="py-14 px-16">
									<h2 class="text-2xl font-bold pb-4 text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section6[0].title }}
									</h2>
									<p class="text-sm text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section6[0].description }}
									</p>
									<ul class="mt-6" data-aos="fade-up" data-aos-delay="500">
										<li class="flex items-center gap-4 mb-2" v-for="(item, index) in posts.data[0].section6[0].lists"
											:key="index">
											<img src="../../assets/images/landing-page/check-filled-icon.svg" alt="">
											<p class="text-sm font-medium text-black">{{ item }}</p>
										</li>
									</ul>
									<span class="absolute top-2 right-2">
										<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-6">
									</span>
								</div>
							</div>

						</div>
					</div>
				</div>
				<div class="inventory-section mb-16"
					v-if="posts.data[0].section7[0].type === 'new_set' && posts.data[0].section7[0].enabled">
					<div class="md:flex items-center">
						<div class="w-full md:w-[70%]">
							<div class="box-cborder box-cborder-h relative rounded-md -mr-2 z-[-1]">
								<div class="p-10 md:p-14 xl:p-16">
									<h2 class="text-2xl font-bold pb-4 text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section7[0].title }}
									</h2>
									<p class="text-sm text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section7[0].description }}
									</p>
									<ul class="mt-6" data-aos="fade-up" data-aos-delay="500">
										<li class="flex items-center gap-4 mb-2" v-for="(item, index) in posts.data[0].section7[0].lists"
											:key="index">
											<img src="../../assets/images/landing-page/check-filled-icon.svg" alt="">
											<p class="text-sm font-medium text-black">{{ item }}</p>
										</li>
									</ul>
									<span class="absolute top-2 left-2">
										<img src="../../assets/images/landing-page/circle-icon-big.svg" alt="" class="w-6">
									</span>
								</div>
							</div>

						</div>
						<div class="w-full md:w-[30%] my-4">
							<div class="image-invent z-50" data-aos="fade-zoom-in" data-aos-delay="100">
								<img class="" :src="`${endpoint}assets/${posts.data[0].section7[0].banner}`" alt="">
							</div>
						</div>

					</div>
				</div>
				<div class="inventory-section mb-16"
					v-if="posts.data[0].section8[0].type === 'new_set' && posts.data[0].section8[0].enabled">
					<div class="md:flex items-center">
						<div class="w-full md:w-[30%] my-4">
							<div class="image-invent z-50" data-aos="fade-zoom-in" data-aos-delay="100">
								<img class="" :src="`${endpoint}assets/${posts.data[0].section8[0].banner}`" alt="">
							</div>
						</div>
						<div class="w-full md:w-[70%]">
							<div class="box-cborder box-cborder-h relative rounded-md -ml-2 z-[-1]">
								<div class="p-10 md:p-14 xl:p-16">
									<h2 class="text-2xl font-bold pb-4 text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section8[0].title }}
									</h2>
									<p class="text-sm text-black" data-aos="fade-up" data-aos-delay="500">
										{{ posts.data[0].section8[0].description }}
									</p>
									<ul class="mt-6" data-aos="fade-up" data-aos-delay="500">
										<li class="flex items-center gap-4 mb-2" v-for="(item, index) in posts.data[0].section8[0].lists"
											:key="index">
											<img src="../../assets/images/landing-page/check-filled-icon.svg" alt="">
											<p class="text-sm font-medium text-black">
												{{ item }}
											</p>
										</li>
									</ul>
									<span class="absolute top-2 right-2">
										<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-6">
									</span>
								</div>
							</div>

						</div>
					</div>
				</div>
				<div class="manage-wrap mb-6"
					v-if="posts.data[0].section9[0].type === 'maine_headings' && posts.data[0].section9[0].enabled">
					<div class="pb-10">
						<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
							data-aos-delay="500">{{ posts.data[0].section9[0].tiny_title }}</span>
						<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500">
							{{ posts.data[0].section9[0].title }}
						</h2>
						<p class="text-black text-base" data-aos="fade-up" data-aos-delay="500">
							{{ posts.data[0].section9[0].description }}
						</p>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="500"
							v-for="(item, index) in posts.data[0].section9.filter(i => i.type === 'tabs_set' && i.enabled)"
							:key="item.id">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img :src="`${endpoint}assets/${item.icon[0]}`" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">{{ item.title }}</h4>
								<p class="text-sm text-[#373737]">{{ item.description }}</p>
							</div>
						</div>
						<!-- <div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="550">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Supplier <br> Management</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="600">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Employee <br> Management
								</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="650">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Expense <br> Management</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="700">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Customer <br> Management</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="750">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Supplier <br> Management</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="800">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Employee <br> Management
								</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div>
						<div class="border border-gray-400 rounded-md relative" data-aos="fade-up" data-aos-delay="850">
							<span
								class=" absolute w-10 h-10 top-0 right-0 bg-[#F96F01] flex justify-center items-center rounded-bl-3xl rounded-tr-md">
								<img src="../../assets/images/landing-page/check-icon.svg" alt="" class="w-4">
							</span>
							<div class="content-inner pt-8 pb-7 px-5">
								<h4 class="text-xl font-semibold mb-3 text-black">Expense <br> Management</h4>
								<p class="text-sm text-[#373737]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. varius ein
									eros
									elementum tristique. Duis</p>
							</div>
						</div> -->
					</div>
				</div>
			</section>
			<!-- Modute -->
			<div v-if="posts.data">
				<section class="software-overview mb-6 pt-10" id="Modules"
					v-if="posts.data[0].section10[0].type === 'maine_headings' && posts.data[0].section10[0].enabled">
					<div class="pb-10">
						<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
							data-aos-delay="500">{{ posts.data[0].section10[0].title }}</span>
						<!-- <h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"><span
								 class="text-[#F96F01] font-bold">Software </span>
							 Overview</h2> -->
						<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500">
							{{ posts.data[0].section10[0].title }}
						</h2>
						<p class="text-black text-base" data-aos="fade-up" data-aos-delay="500">
							{{ posts.data[0].section10[0].description }}
						</p>
					</div>
					<div class="grid grid-cols-3 gap-8">
						<div class="" data-aos="fade-up" data-aos-delay="500"
							v-for="(item, index) in posts.data[0].section10[1].assets_field" :key="index">
							<img :src="`${endpoint}assets/${item}`" alt="overview">
						</div>

					</div>
				</section>
			</div>
		</div>
		<!-- Pricing -->
		<div v-if="posts.data">
			<section class="plans mb-16 pt-10" id="Pricing"
				v-if="posts.data[0].section11[0].type === 'maine_headings' && posts.data[0].section11[0].enabled">
				<div class="max-w-screen-xl mx-auto px-4 pb-10">
					<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
						data-aos-delay="500">{{ posts.data[0].section11[0].tiny_title }}</span>
					<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"
						v-html="posts.data[0].section11[0].title">

					</h2>
					<p class="text-black text-base" data-aos="fade-up" data-aos-delay="500">
						{{ posts.data[0].section11[0].description }}
					</p>
				</div>
				<div class="pricing-plans bg-[#F7F7F7] py-10">
					<div class="max-w-screen-xl mx-auto px-4">
						<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
							<div class="sliver-plan relative bg-white  rounded-xl" data-aos="fade-up" data-aos-delay="500"
								v-for="(item, index) in posts.data[0].section11.filter(i => i.type === 'pricing_tabs' && i.enabled)"
								:key="item.id">
								<div class="px-8 pt-8">
									<span class="absolute top-5 right-5">
										<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-9">
									</span>
									<div class="flex items-center gap-3 mb-6">
										<img :src="`${endpoint}assets/${item.package_icon[0]}`" alt="" class="w-10 h-10">
										<h4 class="text-[17px] font-semibold">{{ item.package }}</h4>
									</div>
									<div class="heading-price">
										<h3 class="text-[45px] font-bold text-[#F96F01] flex items-start">${{ item.package_price }}
											<span class="text-black ml-4 mt-4 font-medium text-sm">/ month</span>
										</h3>
										<p class="text-sm text-black">Get 7 Days Free Trial</p>
										<h4 class="text-right font-semibold text-base mb-1.5">{{ item.package_subtitle }}</h4>
									</div>
								</div>

								<div class="pt-2 border-t border-dashed border-gray-400">
									<div class="px-8 pb-8">
										<ul class="mt-4">
											<li class="flex items-center gap-3 mb-3" v-for="list in item.features">
												<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
												<h5 class="text-sm font-medium text-black">{{ list }}</h5>
											</li>
											<li class="flex items-center gap-3 mb-3" v-if="item.package === 'Silver'">
												<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
												<h5 class="text-sm font-medium text-black">Access from anywhere</h5>
											</li>
											<li class="flex items-center gap-3 mb-3"
												v-if="item.package === 'Silver' || item.package === 'Gold'">
												<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
												<h5 class="text-sm font-medium text-black">Accept payments 24/7</h5>
											</li>
											<li class="flex items-center gap-3 mb-3"
												v-if="item.package === 'Silver' || item.package === 'Gold'">
												<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
												<h5 class="text-sm font-medium text-black">Database Backup</h5>
											</li>
										</ul>
										<div class="call-to-action mt-10">
											<a href="#"
												class="text-black border-2 border-black font-medium rounded-lg text-base flex items-center justify-center w-full py-2 text-center">Get
												Started</a>
										</div>
									</div>

								</div>
							</div>
							<!-- <div class="gold-plan relative bg-white  rounded-xl" data-aos="fade-up" data-aos-delay="600">
							<div class="px-8 pt-8">
								<span class="absolute top-5 right-5">
									<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-9">
								</span>
								<div class="flex items-center gap-3 mb-6">
									<img src="../../assets/images/landing-page/gold.svg" alt="" class="w-10 h-10">
									<h4 class="text-[17px] font-semibold">Gold</h4>
								</div>
								<div class="heading-price">
									<h3 class="text-[45px] font-bold text-[#F96F01] flex items-start">$65
										<span class="text-black ml-4 mt-4 font-medium text-sm">/ month</span>
									</h3>
									<p class="text-sm text-black">Get 7 Days Free Trial</p>
									<h4 class="text-right font-semibold text-base mb-1.5 text-[#F96F01]">Growing Business</h4>
								</div>
							</div>

							<div class="pt-2 border-t border-dashed border-gray-400">
								<div class="px-8 pb-8">
									<ul class="mt-4">
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Customer limit: Unlimited</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Unlimited users</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Customer limit: Unlimited</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
											<h5 class="text-sm font-medium text-black">Access from anywhere</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
											<h5 class="text-sm font-medium text-black">Accept payments 24/7</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/cross.svg" alt="">
											<h5 class="text-sm font-medium text-black">Database Backup</h5>
										</li>
									</ul>
									<div class="call-to-action mt-10">
										<a href="#"
											class="text-white border-2 bg-[#F96F01] border-[#F96F01] font-medium rounded-lg text-base flex items-center justify-center w-full py-2 text-center">Get
											Started</a>
									</div>
								</div>

							</div>
						</div>
						<div class="premium-plan relative bg-white  rounded-xl" data-aos="fade-up" data-aos-delay="700">
							<div class="px-8 pt-8">
								<span class="absolute top-5 right-5">
									<img src="../../assets/images/landing-page/circle-icon.svg" alt="" class="w-9">
								</span>
								<div class="flex items-center gap-3 mb-6">
									<img src="../../assets/images/landing-page/premium.svg" alt="" class="w-10 h-10">
									<h4 class="text-[17px] font-semibold">Silver</h4>
								</div>
								<div class="heading-price">
									<h3 class="text-[45px] font-bold text-[#F96F01] flex items-start">$143
										<span class="text-black ml-4 mt-4 font-medium text-sm">/ month</span>
									</h3>
									<p class="text-sm text-black">Get 7 Days Free Trial</p>
									<h4 class="text-right font-semibold text-base mb-1.5">Pro Marketer</h4>
								</div>
							</div>

							<div class="pt-2 border-t border-dashed border-gray-400">
								<div class="px-8 pb-8">
									<ul class="mt-4">
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Customer limit: Unlimited</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Unlimited users</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Customer limit: Unlimited</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Access from anywhere</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Accept payments 24/7</h5>
										</li>
										<li class="flex items-center gap-3 mb-3">
											<img class="w-4" src="../../assets/images/landing-page/fill-success.svg" alt="">
											<h5 class="text-sm font-medium text-black">Database Backup</h5>
										</li>
									</ul>
									<div class="call-to-action mt-10">
										<a href="#"
											class="text-white border-2 bg-[#F96F01] border-[#F96F01] font-medium rounded-lg text-base flex items-center justify-center w-full py-2 text-center">Get
											Started</a>
									</div>
								</div>

							</div>
						</div> -->
						</div>
					</div>
				</div>

			</section>
		</div>
		<div v-if="posts.data">
			<div class="reviews max-w-screen-xl mx-auto px-4 mb-16"
				v-if="posts.data[0].section12[0].type === 'maine_headings' && posts.data[0].section12[0].enabled">
				<div class="pb-10">
					<span class="text-white bg-[#F96F01] text-xs py-1 px-1.5 rounded-md font-normal" data-aos="fade-up"
						data-aos-delay="500">{{ posts.data[0].section12[0].tiny_title }}</span>
					<!-- <h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"><span
						class="text-[#F96F01] font-bold">Check </span>
					out reviews of our work from others!</h2> -->
					<h2 class="text-3xl font-bold text-black mt-4 mb-4" data-aos="fade-up" data-aos-delay="500"
						v-html="posts.data[0].section12[0].title"> </h2>

					<p class="text-black text-base" data-aos="fade-up" data-aos-delay="500">
						{{ posts.data[0].section12[0].description }}
					</p>
				</div>
				<div class="grid grid-cols-2 xl:grid-cols-4 gap-8">
					<div class="col-span-2" data-aos="fade-up" data-aos-delay="500">
						<div class="bg-[#F96F01] p-8 rounded-md">
							<div class="md:flex gap-4">
								<div class="w-full md:w-[30%] my-4">
									<div class="image-wrap pt-1">
										<img :src="`${endpoint}assets/${posts.data[0].section12[1].profile_photo[0]}`" alt=""
											class="rounded-lg w-[150px] mx-auto">
									</div>
									<div class="heading">
										<h2 class="text-white text-base font-semibold text-center pt-3 pb-1">{{
											posts.data[0].section12[1].name }}</h2>
										<p class=" text-white text-sm font-light text-center">{{ posts.data[0].section12[1].designation }}
										</p>
									</div>
								</div>
								<div class="w-full md:w-[70%]">
									<div class="px-2">
										<p class="text-sm font-normal text-white mb-2 leading-6">{{ posts.data[0].section12[1].about }}</p>
										<div class="flex items-center justify-end w-full">
											<span class="text-white">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
													<path fill-rule="evenodd"
														d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
														clip-rule="evenodd" />
												</svg>
											</span>
											<span class="text-white">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
													<path fill-rule="evenodd"
														d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
														clip-rule="evenodd" />
												</svg>
											</span>
											<span class="text-white">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
													<path fill-rule="evenodd"
														d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
														clip-rule="evenodd" />
												</svg>
											</span>
											<span class="text-white">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
													<path fill-rule="evenodd"
														d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
														clip-rule="evenodd" />
												</svg>
											</span>
											<span class="text-white">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
													<path fill-rule="evenodd"
														d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
														clip-rule="evenodd" />
												</svg>
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="bg-[#fff3eb] rounded-md p-4 pt-9" data-aos="fade-up" data-aos-delay="600">
						<div class="image-wrap">
							<img :src="`${endpoint}assets/${posts.data[0].section12[2].profile_photo[0]}`" alt=""
								class="mx-auto w-[130px]">
						</div>
						<div class="heading pt-1">
							<h2 class="text-black text-[18px] font-bold text-center pt-3 pb-1">{{ posts.data[0].section12[2].name }}
							</h2>
							<p class="text-black text-sm font-light text-center">{{ posts.data[0].section12[2].designation }}</p>
						</div>
						<div class="flex items-center justify-center mt-3 w-full">
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
						</div>

					</div>
					<div class="bg-[#fff3eb] rounded-md p-4 pt-9" data-aos="fade-up" data-aos-delay="700">
						<div class="image-wrap">
							<img src="../../assets/images/landing-page/review-3.jpg" alt="" class="mx-auto w-[130px]">
						</div>
						<div class="heading pt-1">
							<h2 class="text-black text-[18px] font-bold text-center pt-3 pb-1">Theodore</h2>
							<p class="text-black text-sm font-light text-center">Project Manager</p>
						</div>
						<div class="flex items-center justify-center mt-3 w-full">
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
							<span class="text-[#F96F01]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
									<path fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd" />
								</svg>
							</span>
						</div>

					</div>
				</div>
			</div>
		</div>



	</div>

	<footer class="bg-black pt-[150px]">
		<div class="max-w-screen-xl mx-auto px-4">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-[80px] xl:gap-[120px]">
				<div class="">
					<div class="foot-logo">
						<a href="#">
							<img src="../../assets/images/landing-page/foot-logo.png" alt="logo" class=" ">
						</a>
					</div>
					<div class="content pt-4">
						<p class="text-white py-4">Jaldi is an all-in-one management system manage expenses, purchases, sales,
							payments, accounting, loans, assets, payroll, and many more.</p>
						<ul class="flex flex-wrap items-center gap-2 mt-4">
							<li class="mb-2" v-for="nav in posts.menu" :key="nav.title"><a @click.prevent="scrollToSection(nav.title)" :href="`#${nav.title}`" class="py-1 px-2 text-sm text-black bg-white rounded-md">{{nav.title}}</a></li>
							<!-- <li><a href="#" class="py-1 px-2 text-sm text-black bg-white rounded-md">About</a></li>
							<li><a href="#" class="py-1 px-2 text-sm text-black bg-white rounded-md">Features</a></li>
							<li><a href="#" class="py-1 px-2 text-sm text-black bg-white rounded-md">Modules</a></li>
							<li><a href="#" class="py-1 px-2 text-sm text-black bg-white rounded-md">Pricing</a></li> -->
						</ul>
					</div>
				</div>
				<div class="max-w-lg lg:ml-auto">
					<div class="mb-2">
						<label class="block mb-4 text-xl font-semibold text-white">Subscribe</label>
						<div class="flex gap-4">
							<input type="text" id="first_name"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								placeholder="Enter your email" required />
							<button
								class="text-white border-2 bg-[#F96F01] border-[#F96F01] font-medium rounded-lg text-base flex items-center justify-center px-4 py-2 text-center">Subscribe</button>
						</div>
					</div>
					<h5 class="text-white mt-5">By subscribing you agree to with our <a href="#"
							class="border-b-2 border-[#F96F01] pb-2 font-semibold ml-2">Privacy Policy</a></h5>
					<div class="mt-10">
						<ul class="flex items-center gap-4" v-if="posts.data">
							<li v-for="social in posts.data[0].section13" :key="social.id">
								<!-- <a :href="social.url" target="_blank">  <img :src="`${endpoint}assets/${social.icon[0]}`" :alt="social.title"> </a> -->
								<a :href="addProtocolToUrl(social.url)" target="_blank">
									<img :src="`${endpoint}assets/${social.icon[0]}`" :alt="social.title">
								</a>
							</li>
							<!-- <li><a href="#"> <img src="../../assets/images/landing-page/twitter-x.svg" alt="twitter-x"> </a></li>
							<li><a href="#"> <img src="../../assets/images/landing-page/linkedin.svg" alt="linkedin"> </a></li>
							<li><a href="#"> <img src="../../assets/images/landing-page/instagram.svg" alt="instagram"> </a></li> -->
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="bg-[#F96F01] py-2 mt-14">
			<div class="max-w-screen-xl mx-auto px-4 py-2 lg:py-0">
				<div class="sm:flex justify-between">
					<p class="text-white text-xs mb-2 lg:mb-0">© 2024 Jaldi. All rights reserved.</p>
					<div class="flex flex-wrap gap-2 items-center text-xs">
						<a href="#" class="text-white">Privacy Policy</a>
						<span class="text-white">|</span>
						<a href="#" class="text-white">Terms of Service</a>
						<span class="text-white">|</span>
						<a href="#" class="text-white">Cookies Settings</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

h1,
h2,
h3,
h4,
h5,
h6,
p,
span,
a,
button,
input,
select {
	font-family: "Poppins", sans-serif;

}
</style>