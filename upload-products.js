/**
 * ============================================
 * Upload 50 Indonesian Snacks to Firestore
 * ============================================
 *
 * This script uploads 50 Indonesian snack products to Firebase Firestore.
 * Run this script in a browser console after Firebase is initialized.
 *
 * Usage:
 * 1. Open browser console on your Snack Store page
 * 2. Copy and paste this entire script
 * 3. Call uploadProductsToFirestore() to upload all products
 */

// Indonesian Snacks Data (50 products)
const snackProducts = [
    {
        name: "Keripik Pisang",
        price: 15000,
        image: "https://picsum.photos/400?random=1",
        description: "Renyah dan gurih, dibuat dari pisang pilihan yang dipotong tipis dan digoreng sempurna. Camilan tradisional Indonesia yang favorit.",
        stock: 50,
        category: "Keripik"
    },
    {
        name: "Basreng",
        price: 12000,
        image: "https://picsum.photos/400?random=2",
        description: "Ikan lele goreng dengan bumbu pedas meresap. Cocok untuk camilan saat santai.",
        stock: 45,
        category: "Gorengan"
    },
    {
        name: "Makaroni Pedas",
        price: 10000,
        image: "https://picsum.photos/400?random=3",
        description: "Makaroni gurih dengan tingkat kepedasan yang dapat disesuaikan. Camilan kekinian yang sangat populer.",
        stock: 60,
        category: "Mie"
    },
    {
        name: "Seblak Kering",
        price: 18000,
        image: "https://picsum.photos/400?random=4",
        description: "Kerupuk seblak kering dengan bumbu pedas dan kencur yang khas. Renyah dan addictif!",
        stock: 40,
        category: "Kerupuk"
    },
    {
        name: "Keripik Singkong",
        price: 12000,
        image: "https://picsum.photos/400?random=5",
        description: "Keripik dari singkong segar yang digoreng hingga renyah. Tersedia dalam berbagai rasa.",
        stock: 55,
        category: "Keripik"
    },
    {
        name: "Keripik Kentang",
        price: 14000,
        image: "https://picsum.photos/400?random=6",
        description: "Kentang iris tipis digoreng renyah. Camilan klasik yang tidak pernah gagal memuaskan.",
        stock: 50,
        category: "Keripik"
    },
    {
        name: "Kerupuk Udang",
        price: 16000,
        image: "https://picsum.photos/400?random=7",
        description: "Kerupuk tradisional dari udang segar. Empuk dan lezat dimakan dengan nasi.",
        stock: 35,
        category: "Kerupuk"
    },
    {
        name: "Kerupuk Mie",
        price: 8000,
        image: "https://picsum.photos/400?random=8",
        description: "Kerupuk dari mie kuning digoreng hingga mengembang. Camilan murah meriah favorit anak-anak.",
        stock: 70,
        category: "Kerupuk"
    },
    {
        name: "Kacang Goreng",
        price: 15000,
        image: "https://picsum.photos/400?random=9",
        description: "Kacang tanah goreng dengan balutan bawang dan garam. Gurih dan kaya rasa.",
        stock: 45,
        category: "Kacang"
    },
    {
        name: "Kacang Renyah",
        price: 18000,
        image: "https://picsum.photos/400?random=10",
        description: "Kacang mete atau kacang tanah dengan tekstur renyah. Camilan tinggi protein.",
        stock: 40,
        category: "Kacang"
    },
    {
        name: "Pisang Goreng",
        price: 12000,
        image: "https://picsum.photos/400?random=11",
        description: "Pisang goreng golden crispy dengan taburan gula aren. Legendaris dan selalu memikat.",
        stock: 30,
        category: "Gorengan"
    },
    {
        name: "Lemper",
        price: 10000,
        image: "https://picsum.photos/400?random=12",
        description: "Ketan isi ayam atau daging yang dibungkus daun pandan. Aromatik dan lezat.",
        stock: 25,
        category: "Makanan Ringan"
    },
    {
        name: "Kue Lumpur",
        price: 8000,
        image: "https://picsum.photos/400?random=13",
        description: "Kue lembut dengan topping parut. Camilan manis favorit semua usia.",
        stock: 20,
        category: "Kue"
    },
    {
        name: "Risoles",
        price: 12000,
        image: "https://picsum.photos/400?random=14",
        description: "Rolade kulit tipis isi Ragout. Goreng hingga keemasan, renyah di luar lembut di dalam.",
        stock: 30,
        category: "Makanan Ringan"
    },
    {
        name: "Martabak Manis",
        price: 25000,
        image: "https://picsum.photos/400?random=15",
        description: "Martabak Teflon dengan topping cokelat,keju, atau kacang. Camilan malam hari yang sempurna.",
        stock: 15,
        category: "Kue"
    },
    {
        name: "Donat",
        price: 10000,
        image: "https://picsum.photos/400?random=16",
        description: "Donat lembut dengan glazur cokelat atau gula halus. Favorit semua ages!",
        stock: 35,
        category: "Kue"
    },
    {
        name: "Nastar",
        price: 35000,
        image: "https://picsum.photos/400?random=17",
        description: "Kue nastar klasik dengan isian nanas. Wajib ada di setiap hari raya!",
        stock: 25,
        category: "Kue"
    },
    {
        name: "Kue Ketan Hitam",
        price: 20000,
        image: "https://picsum.photos/400?random=18",
        description: "Kue ketan hitam lembut dengan santan. Kaya akan serat dan rasa.",
        stock: 20,
        category: "Kue"
    },
    {
        name: "Lapis Legit",
        price: 45000,
        image: "https://picsum.photos/400?random=19",
        description: "Kue lapis legit dengan 18-25 lapisan. Mahal tapi worth it!",
        stock: 10,
        category: "Kue"
    },
    {
        name: "Putri Salju",
        price: 30000,
        image: "https://picsum.photos/400?random=20",
        description: "Kue kering taburan gula halus seperti salju. Renyah dan manis.",
        stock: 30,
        category: "Kue"
    },
    {
        name: "Kerupuk Bawang",
        price: 12000,
        image: "https://picsum.photos/400?random=21",
        description: "Kerupuk udang dengan taburan bawang. Wajib ada di setiap meja makan.",
        stock: 50,
        category: "Kerupuk"
    },
    {
        name: "Kerupuk Kulit",
        price: 15000,
        image: "https://picsum.photos/400?random=22",
        description: "Kerupuk dari kulit kerbau digoreng renyah. Camilan tahan lama.",
        stock: 40,
        category: "Kerupuk"
    },
    {
        name: "Tahu Bulat",
        price: 5000,
        image: "https://picsum.photos/400?random=23",
        description: "Tahu digoreng dadakan dengan taburan cabe dan garam. Camilan jalan kaki favorit!",
        stock: 100,
        category: "Gorengan"
    },
    {
        name: "Tahu Sumedang",
        price: 8000,
        image: "https://picsum.photos/400?random=24",
        description: "Tahu goreng khas Sumedang dengan tekstur porous dan rasa gurih.",
        stock: 45,
        category: "Gorengan"
    },
    {
        name: "Tempe Goreng",
        price: 8000,
        image: "https://picsum.photos/400?random=25",
        description: "Tempe digoreng dengan bumbu sederhana. Sehat dan mengenyangkan.",
        stock: 50,
        category: "Gorengan"
    },
    {
        name: "Cireng",
        price: 10000,
        image: "https://picsum.photos/400?random=26",
        description: "Aci digoreng hingga kenyal. Disajikan dengan sambal kacang pedas.",
        stock: 40,
        category: "Gorengan"
    },
    {
        name: "Pentol",
        price: 15000,
        image: "https://picsum.photos/400?random=27",
        description: "Bola-bola aci kenyal dengan topping sambal. Sangat populer di Jawa Tengah.",
        stock: 35,
        category: "Makanan Ringan"
    },
    {
        name: "Batagor",
        price: 18000,
        image: "https://picsum.photos/400?random=28",
        description: "Baso tahu gorengan dengan siraman kacang. Nikmat dimakan hangat.",
        stock: 30,
        category: "Gorengan"
    },
    {
        name: "Siomay",
        price: 15000,
        image: "https://picsum.photos/400?random=29",
        description: "Dimsum khas Bandung dengan sambal kacang. Cocok untuk camilan sore.",
        stock: 35,
        category: "Makanan Ringan"
    },
    {
        name: "Gehu",
        price: 8000,
        image: "https://picsum.photos/400?random=30",
        description: "Tahu isi sayuran digoreng crispy. Renyah di luar lembut di dalam.",
        stock: 40,
        category: "Gorengan"
    },
    {
        name: "Molen",
        price: 6000,
        image: "https://picsum.photos/400?random=31",
        description: "Pisang goreng berbentuk pipih. Lebih tipis dan crispy dari pisang goreng biasa.",
        stock: 60,
        category: "Gorengan"
    },
    {
        name: "Bala-bala",
        price: 8000,
        image: "https://picsum.photos/400?random=32",
        description: "Bakwan sayuran gorengan. Renyah dengan isian wortel dan kol.",
        stock: 50,
        category: "Gorengan"
    },
    {
        name: "Pastel",
        price: 10000,
        image: "https://picsum.photos/400?random=33",
        description: "Kulit pastry isi sayuran atau daging. Goreng hingga keemasan.",
        stock: 30,
        category: "Makanan Ringan"
    },
    {
        name: "Kue Pancong",
        price: 8000,
        image: "https://picsum.photos/400?random=34",
        description: "Kue dari santan dan gula aren. Teksturnya unik!",
        stock: 25,
        category: "Kue"
    },
    {
        name: "Kue Cucur",
        price: 6000,
        image: "https://picsum.photos/400?random=35",
        description: "Kue cucur gula merah. Empuk dengan aroma harum daun pandan.",
        stock: 30,
        category: "Kue"
    },
    {
        name: "Gorpey",
        price: 5000,
        image: "https://picsum.photos/400?random=36",
        description: "Kerupuk geprek sambal. Sensasi pedas yang addictif!",
        stock: 80,
        category: "Kerupuk"
    },
    {
        name: "Kerupuk Palembang",
        price: 18000,
        image: "https://picsum.photos/400?random=37",
        description: "Kerupuk khas Palembang yang sangat besar dan mengembang.",
        stock: 30,
        category: "Kerupuk"
    },
    {
        name: "Kerupuk Jabrik",
        price: 20000,
        image: "https://picsum.photos/400?random=38",
        description: "Kerupuk dari tapioka dengan tekstur lembut dan empuk.",
        stock: 25,
        category: "Kerupuk"
    },
    {
        name: "Kopi Luak",
        price: 50000,
        image: "https://picsum.photos/400?random=39",
        description: "Kopi premium dari biji yang dimakan luak. Aromanya sangat khas.",
        stock: 10,
        category: "Minuman"
    },
    {
        name: "Kue Brownies",
        price: 30000,
        image: "https://picsum.photos/400?random=40",
        description: "Brownies cokelat lembut dengan topping kacang atau cokelat.",
        stock: 20,
        category: "Kue"
    },
    {
        name: "Choco Banana",
        price: 12000,
        image: "https://picsum.photos/400?random=41",
        description: "Pisang lure dengan taburan cokelat. Camilan manis yang hits!",
        stock: 35,
        category: "Gorengan"
    },
    {
        name: "Tahu Walik",
        price: 10000,
        image: "https://picsum.photos/400?random=42",
        description: "Tahu dibalik isian ayam. Tekstur garing dan isiannya juicy!",
        stock: 40,
        category: "Gorengan"
    },
    {
        name: "Mie Goreng",
        price: 15000,
        image: "https://picsum.photos/400?random=43",
        description: "Mie goreng dengan bumbu kecap dan topping sayuran. Praktis dan lezat.",
        stock: 45,
        category: "Mie"
    },
    {
        name: "Mie Rebus",
        price: 15000,
        image: "https://picsum.photos/400?random=44",
        description: "Mie rebus dengan kuah gurih dan topping telur atau ayam.",
        stock: 45,
        category: "Mie"
    },
    {
        name: "Keripik Jamur",
        price: 18000,
        image: "https://picsum.photos/400?random=45",
        description: "Keripik dari jamur tiram yang digoreng renyah. Tinggi protein!",
        stock: 30,
        category: "Keripik"
    },
    {
        name: "Keripik Talas",
        price: 14000,
        image: "https://picsum.photos/400?random=46",
        description: "Keripik dari talas atau keladi. Rasanya unik dan berbeda!",
        stock: 35,
        category: "Keripik"
    },
    {
        name: "Keripik Nangka",
        price: 16000,
        image: "https://picsum.photos/400?random=47",
        description: "Keripik dari buah nangka muda. Rasanya manis dan gurih!",
        stock: 30,
        category: "Keripik"
    },
    {
        name: "Kue Talam",
        price: 10000,
        image: "https://picsum.photos/400?random=48",
        description: "Kue talam pandan dengan taburan证据. Lembut dan harum.",
        stock: 25,
        category: "Kue"
    },
    {
        name: "Bolu Kukus",
        price: 12000,
        image: "https://picsum.photos/400?random=49",
        description: "Bolu kukus mekar dengan topping meses atau parut. Moist dan fluffy!",
        stock: 30,
        category: "Kue"
    },
    {
        name: "Kue Jongkong",
        price: 8000,
        image: "https://picsum.photos/400?random=50",
        description: "Kue lembut daritepung kanji dengan kuah santan. Nikmat!",
        stock: 25,
        category: "Kue"
    }
];

/**
 * Function to upload all products to Firestore
 */
async function uploadProductsToFirestore() {
    // Check if Firebase is initialized
    if (!firebase || !firebase.firestore) {
        console.error('Firebase not initialized. Please initialize Firebase first.');
        alert('Firebase not initialized. Please initialize Firebase first.');
        return;
    }

    const db = firebase.firestore();
    const batch = db.batch();
    const productsRef = db.collection('products');

    console.log('Starting upload of ' + snackProducts.length + ' products...');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < snackProducts.length; i++) {
        const product = snackProducts[i];
        try {
            // Generate a unique ID based on product name
            const productId = product.name.toLowerCase().replace(/\s+/g, '-');

            // Set product data
            const docRef = productsRef.doc(productId);
            batch.set(docRef, product);

            successCount++;
            console.log('Queued: ' + product.name);
        } catch (error) {
            errorCount++;
            console.error('Error queuing ' + product.name + ':', error);
        }
    }

    // Commit the batch
    try {
        await batch.commit();
        console.log('Successfully uploaded ' + successCount + ' products to Firestore!');
        alert('Successfully uploaded ' + successCount + ' products to Firestore!');
    } catch (error) {
        console.error('Error committing batch:', error);
        alert('Error uploading products: ' + error.message);
    }
}

// Make function available globally
window.uploadProductsToFirestore = uploadProductsToFirestore;

// Auto-run if Firebase is already initialized
if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
    console.log('Firebase is already initialized. Ready to upload products.');
    console.log('Run uploadProductsToFirestore() to upload all products.');
} else {
    console.log('Please initialize Firebase before running uploadProductsToFirestore()');
}
