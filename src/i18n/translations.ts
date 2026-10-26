/* =============================================================================
   KAMUS BAHASA

   Semua teks yang tampil di situs tinggal di sini, dipisah per bahasa.
   Komponen tidak menulis teks langsung; ambil lewat t("...") dari useLanguage.
   Dengan begitu mengganti bahasa langsung mengganti seluruh isi halaman.

   Bahasa default: Inggris — audience XRP Ledger mayoritas berbahasa Inggris.
   ============================================================================= */

export const translations = {
  en: {
    /* Nama menu memakai bahasa galeri, bukan bahasa perangkat lunak:
       "Atrium" ruang masuk, "Collection" terbitan, "Compose" tempat menyusun
       karya, "Studio" sang pembuatnya, "Reach" kanal masuk. Kunci kamusnya
       tetap home/collection/generate/about/contact — kunci itu hanya nama di
       dalam kode, tidak terlihat pengunjung, dan sudah dipakai puluhan tempat.

       Menu About sengaja TIDAK bernama "The Voidline": nama itu sudah ada di
       logo kiri navbar, dan mengulanginya membuat satu baris memuat kata yang
       sama dua kali. */
    nav: {
      home: "Atrium",
      collection: "Collection",
      generate: "Compose",
      about: "Studio",
      contact: "Reach",
      buyNow: "Buy Now",
      menu: "Menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      skipToContent: "Skip to content",
      composeComingSoon: "The generator is not open yet.",
    },

    footer: {
      rights: "All rights reserved.",
      tagline: "Red · Black · White",
    },

    page: {
      home: {
        title: "Home",
        subtitle: "Landing page content will be added here.",
      },
      collection: {
        title: "Collection",
        subtitle: "Every Voidline Island collection in one place. Mint directly here — no need to leave the site.",
      },
      newCollection: {
        title: "Newest Collection",
        subtitle: "The latest release from Voidline Island — fresh from the XRP Ledger, updated automatically.",
      },
      generate: {
        title: "Compose",
        kicker: "Make Your Own",
        lead:
          "Upload your layer folders and the studio assembles every artwork for you — finished images and metadata, ready to mint on the XRP Ledger.",
        privacy: "Everything runs in your browser. Your images never leave your device.",
        saved: "Saved on this device",
        savedAt: "Saved on this device at {waktu}",
        saveFailed:
          "The project could not be saved — this browser's storage may be full. Export a ZIP to keep your work.",
        restoring: "Restoring your saved project…",
        errors: {
          unsupportedSize: "The file format is not supported, or the file is larger than 10 MB.",
          noUsableFiles: "No usable files were found.",
          skipped:
            "{jumlah} file skipped — unsupported format or larger than 10 MB.",
          unreadableFile: "One file could not be read and is not usable yet.",
          exampleFailed: "The demo project failed to load.",
        },
        startNew: "Start a new project",
        startNewConfirm:
          "Delete the saved project and all of its images from this browser? This cannot be undone.",
        addLayer: "Add layer",
        build: "Build collection",
        generating: "Building {selesai} of {total}…",
        cancel: "Cancel",
        cancelled: "Generation cancelled. Nothing was saved.",
        blocked: "Add at least one layer with traits to enable generation.",
        ctaExample: "See a finished collection",
        closingTitle: "Try it with your own artwork",
        closingBody:
          "Nothing is uploaded and nothing is charged. Keep stacking layers until the preview looks right.",
        flow: {
          kicker: "How it works",
          title: "Four steps from artwork to collection",
        },
        steps: {
          upload: {
            title: "Add your layers",
            body: "Type a layer name and drop in the images for it — background, head, body, hand, and so on.",
          },
          order: {
            title: "Set the stacking order",
            body: "The top layer in the list is drawn last, over the others. Move any layer up or down until it looks right.",
          },
          rarity: {
            title: "Tune the rarity",
            body: "Give each trait a weight. Higher weight appears more often. A weight of zero switches that trait off.",
          },
          build: {
            title: "Build and download",
            body: "Choose the edition size, build the collection, then take one ZIP holding every image and its metadata.",
          },
        },
        details: {
          orderTitle: "Which layer goes in front?",
          orderBody:
            "The list is read front to back: the layer at the top of the list is drawn last and covers the ones below it. Backgrounds belong at the bottom, heads and hands near the top.",
          filesTitle: "What image files can I use?",
          filesBody:
            "PNG, JPEG, WebP, GIF, or SVG, up to 10 MB each. Transparent PNG is best for layers that sit on top of a background. Name your files in a way that reads well — the file name becomes the trait name in the metadata.",
        },
        cta: {
          title: "Ready to build a collection?",
          body: "Sign in to the studio area to upload your layers and generate your first collection.",
          start: "Start generating",
          example: "See a finished collection",
          needAccount: "The account system is not open yet",
        },
      },
      generator: {
        newLayerName: "New layer",
        projectName: "Project name",
        projectNamePlaceholder: "Untitled project",
        layersTitle: "Layers",
        layersHint: "The list reads front to back — the top layer is drawn last, on top of the others.",
        noLayersTitle: "No layers yet",
        noLayersBody: "Start by adding a layer, then drop in the images for it.",
        start: {
          title: "Start with a blank canvas",
          body: "Three ways in. Pick whichever matches what you have ready — everything stays in this browser.",
          uploadTitle: "Upload images",
          uploadBody: "Pick your files; layers are grouped from their file names.",
          demoTitle: "Load demo collection",
          demoBody: "A ready-made set of four layers. Good for trying the engine first.",
          loadingDemo: "Building the demo…",
          manualTitle: "Build it manually",
          manualBody: "Name a layer first, then add its images one by one.",
        },
        dismiss: "Dismiss",
        preview: {
          title: "Live preview",
          shuffle: "Shuffle",
          empty: "Add layers and traits to see a live preview.",
          canvasLabel: "Preview of a generated combination",
          loading: "Drawing preview…",
          failed: "The preview could not be drawn. Try shuffling, or check that the image files can be read.",
        },
        dropzone: {
          loading: "Reading files…",
        },
        layer: {
          collapse: "Collapse layer",
          expand: "Expand layer",
          nameLabel: "Layer name",
          moveForward: "Move layer forward",
          moveBackward: "Move layer backward",
          delete: "Delete layer",
          emptyTitle: "Drop images here",
          emptyBody: "Or click to choose files",
          addMore: "Add more images",
          position: "Layer {posisi} of {total}",
        },
        trait: {
          include: "Include in generation",
          exclude: "Exclude from generation",
          nameLabel: "Trait name",
          weightLabel: "Weight",
          weightHint: "Higher weight appears more often. 0 disables this trait.",
          delete: "Delete trait",
        },
        settings: {
          title: "Collection settings",
          collectionName: "Collection name",
          collectionNamePlaceholder: "Mom Apes Voidline",
          namePreview: "Items will be named {contoh}",
          untitled: "Untitled",
          editionSize: "Edition size",
          startTokenId: "Start token ID",
          outputSize: "Output size",
          outputSizeHint: "Each artwork is {sisi} × {sisi} px. Layers are scaled to fit without stretching.",
          noLayers: "Add a layer to see how many combinations are possible.",
          layerEmpty: "Every layer needs at least one active trait before you can generate.",
          combinations: "{jumlah} unique combinations possible.",
          combinationsShort: "Only {jumlah} unique combinations — fewer than your edition size, so some items would repeat.",
        },
        results: {
          kicker: "Collection ready",
          title: "Your generated artworks",
          summary: "{jumlah} items at {lebar} × {tinggi} px. Download any item on its own, or take the whole set.",
          downloadOne: "Download {nama} as PNG",
          downloadZip: "Download ZIP",
          zipping: "Packing…",
          edit: "Edit",
          editItem: "Edit {nama}",
          lock: "Lock item",
          unlock: "Unlock item",
          locked: "Locked",
          lockedCount: "{terkunci} of {total} locked",
          lockAll: "Lock all",
          unlockAll: "Unlock all",
          renumber: "Renumber",
          renumberHint: "Number items from the start token ID in collection settings.",
          reroll: "Re-roll",
          remove: "Replace",
          wouldDuplicate: "This would duplicate another item",
          errDuplicate: "That change would make this item identical to another one. Nothing was changed.",
          errLocked: "This item is locked. Unlock it first to edit it.",
          errExhausted: "Every possible combination is already used. Nothing was changed.",
          errMissing: "That item could not be found. Nothing was changed.",
        },
        errors: {
          notEnough: "Only {tersedia} unique combinations exist, but {diminta} were requested. Lower the edition size or add more traits.",
          missingFiles: "{nama}: the image could not be read, so it is left out of the result.",
          failed: "Generation stopped: {pesan}",
        },
      },
      notFound: {
        title: "This page does not exist",
        body: "The address may have changed or been mistyped. Everything else is still where you left it.",
        home: "Back to home",
        collection: "Browse the collection",
      },
      /* Muncul saat React gagal merender sebuah halaman. Nadanya sengaja tidak
         menyebut "kesalahan" atau kode: pengunjung tidak bisa memperbaikinya,
         dan yang mereka butuhkan hanya jalan kembali ke beranda. */
      error: {
        title: "Something went wrong on this page",
        body: "The page could not be displayed. Reloading usually fixes it — nothing you saved was lost.",
        home: "Back to home",
      },
      about: {
        title: "Studio",
        subtitle: "Information about the studio will be added here.",
      },
      contact: {
        title: "Reach",
        kicker: "Get in Touch",
        subtitle: "Contact details will be added here.",
        lead:
          "Two things we take on: custom artwork for collectors, and studio services for other creators — PNG art, animated GIFs, websites, and generator setups with ready metadata.",
        status: {
          open: "Taking new work",
          terms: "Scope and terms agreed up front",
          reply: "Replies in one to two working days",
        },
        commission: {
          num: "01 — Commission",
          title: "Custom artwork, made for you",
          body:
            "One piece or a short series in the Voidline style — red, black and white, built from dots and lines that move. Tell us what it is for, and the scope is agreed before anything is drawn.",
          cta: "Start a commission",
          chips: {
            single: "Single piece",
            series: "Series",
            commercial: "Commercial use",
            revenue: "Revenue share",
          },
        },
        services: {
          title: "Studio services",
          sub:
            "The same things we build for our own collections, for creators who would rather work with us than start from scratch.",
          foot:
            "The list may grow. If what you need is not here, ask — we will say plainly whether we can do it.",
          items: {
            png: {
              name: "PNG artwork",
              note: "Hand-drawn pieces, delivered at full resolution.",
            },
            gif: {
              name: "Animated GIF",
              note: "Looping animation — the form we know best.",
            },
            web: {
              name: "Website",
              note: "A site like this one, built and handed over ready to run.",
            },
            generator: {
              name: "Generator & metadata",
              note: "Layered collection generator with metadata, filled from a sample you provide.",
            },
          },
        },
        before: {
          title: "Before you write",
          steps: {
            "1": {
              title: "Say what it is for",
              body:
                "A collection, a personal piece, a product, a site. The purpose decides the shape of the work, so it is worth agreeing on first.",
            },
            "2": {
              title: "Send one or two references",
              body:
                "Anything that shows the direction — ours or someone else's. One picture saves a paragraph of explanation.",
            },
            "3": {
              title: "Name your deadline",
              body:
                "We work to a deadline rather than fixed hours. A real date tells us at once whether the work fits.",
            },
          },
        },
        policy: {
          nft: {
            title: "Buying an NFT",
            body:
              "Every collection is minted on the XRP Ledger and minted directly on its own page. Minting does not happen by message — see",
            link: "the collections",
          },
          karya: {
            title: "Using collection artwork",
            body:
              "The collections are personal work, not stock. When you own a piece you may resell or mirror it; anything else needs a written agreement first.",
          },
          kolaborasi: {
            title: "Collaboration",
            body:
              "Exhibitions, interviews and joint projects are welcome. Tell us the shape of the idea and what you expect from the studio, and we will reply with what we can offer.",
          },
        },
        channels: {
          title: "Write to us",
          discordLabel: "Discord — the quickest route",
          discordName: "Voidline Island",
          discordCta: "Open Discord",
          x: "X",
          instagram: "Instagram",
          threads: "Threads",
        },
        studio: {
          title: "About the studio",
          body:
            "A drawing style built from living dots and lines, held to three colours without compromise. We make looping animated GIFs, mint them on the XRP Ledger, and build the tools that let others do the same.",
          cta: "The studio story →",
        },
        replyNote: "The studio replies within one to two working days.",
      },
    },

    collection: {
      mintNow: "Mint Now",
      viewCollection: "View collection",
      mintHere: "Mint on xrp.cafe",
      mintOutside: "Minting for this collection is not set up here yet — the piece is viewable on xrp.cafe.",
      viewOnXrpCafe: "View on xrp.cafe",
      back: "Back to collections",
      imageSoon: "Artwork coming soon",
      count: "{count} collections",
      works: "{count} pieces",
      allWorks: "All pieces",
      loadingArt: "Loading artwork…",
      artFailed: "The artwork could not be loaded from IPFS.",
      mintLabel: "Mint on XRPL",
      standardLabel: "XRPL Standard",
      standardNote:
        "Every Voidline collection is minted on the XRP Ledger under the XLS-20 standard — the same rules for every piece, whoever mints it.",
      standardCta: "About the studio",
      loading: "Loading mint…",
      loadFailed:
        "The mint box could not be loaded. Open it directly on xrp.cafe using the link below.",
      mintNote: "Using GemWallet? Mint directly on",
      notFound: {
        title: "Collection not found",
        subtitle: "The collection you are looking for does not exist or is no longer available.",
      },
      workNotFound: "This piece does not exist or is no longer listed.",
      newCollectionLabel: "Newest collection",
      newCollectionEmpty:
        "No new collection is live yet. The newest release will appear here automatically once it is minted.",
      newCollectionBrowse: "Browse all collections",
      soldOut: "Sold out",
      available: "Available",
      soldOutNote: "This piece already has an owner. It can still be viewed on xrp.cafe.",
      tokenId: "NFTokenID",
      apes: {
        title: "Apes Voidline",
        subtitle: "The Apes Voidline collection by Voidline Island.",
      },
      jajang: {
        title: "Jajang Voidline",
        subtitle: "The Jajang Voidline collection by Voidline Island.",
      },
      fineart: {
        title: "Fine Art Voidline",
        subtitle: "The Fine Art Voidline collection by Voidline Island.",
      },
      filterLabel: "Collection",
      searchLabel: "Search artworks",
      searchPlaceholder: "Search by title or edition number…",
      allCollections: "All collections ({count})",
      noMatch: "No artwork matches that search.",
      kelompok: {
        apid: "Apes Voidline",
        favo: "Fine Art Voidline",
        javo: "Jajang Voidline",
        neo: "Neo",
        lepas: "Standalone pieces",
        puko: "Pukonimichi",
      },
    },

    /* Sorotan karya di beranda. Judul dan catatan tiap karya ada di sini,
       bukan di src/data/sorotan.ts — supaya berkas data tetap bebas teks. */
    sorotan: {
      kicker: "Selected Works",
      judul: "The pieces worth a second look",
      ket:
        "A handful of pieces from the latest album, chosen one by one. The rest of the collection lives on xrp.cafe.",
      lihatSemua: "See the full album",
      segera: "Coming soon",
      misteri: "Unrevealed",
      sebelumnya: "Previous piece",
      berikutnya: "Next piece",
      keKarya: "Go to piece {n}",
      "1": { judul: "First Light", catatan: "1 of 1" },
      "2": { judul: "Red Line", catatan: "Legendary" },
      "3": { judul: "Quiet Room", catatan: "Rare" },
      "4": { judul: "Static Bloom", catatan: "1 of 1" },
      "5": { judul: "Night Ledger", catatan: "Legendary" },
      "6": { judul: "Half Tone", catatan: "Rare" },
      "7": { judul: "Paper Cut", catatan: "Uncommon" },
      "8": { judul: "Last Frame", catatan: "1 of 1" },
      "9": { judul: "Second Sun", catatan: "Rare" },
      "10": { judul: "Night Draft", catatan: "Uncommon" },
    },

    home: {
      hero: {
        badge: "Welcome to Jajang Osle's NFT Gallery",
        title: "NFT GIF Animation",
        subtitle:
          "Voidline is gif animation art made frame by frame, bringing the movement of dots and lines to life.",
        ctaCollections: "Explore Collections",
        ctaLatestCollection: "Newest collection",
      },
      stats: {
        collections: "Collections",
        artworks: "Artworks",
        standard: "XRPL Standard",
        standardValue: "XLS-20",
      },
      rilis: {
        badge: "Releasing today",
        title: "Mom Ape — new collection drops today",
        subtitle:
          "The newest Voidline collection is live on xrp.cafe. Grab yours while the drop is open.",
        cta: "Mint on xrp.cafe",
        pengantar:
          "Every claim window, every batch, and every piece in this drop is listed on one page — open it to see what you qualify for.",
        ajakan: "See the drop details",
      },
      collections: {
        kicker: "The Work",
        title: "Featured Collections",
        subtitle:
          "Each collection is drawn by hand and minted straight from this site — no detours.",
        viewAll: "View all collections",
      },
      gallery: {
        kicker: "Latest Works",
        title: "Fresh from the ledger",
        subtitle:
          "A rotating strip of pieces from every collection — each one live on the XRP Ledger and minted from this site.",
        cta: "See all 654 pieces",
      },
      generate: {
        kicker: "The Tool",
        title: "Make your own collection",
        subtitle:
          "Upload your layer folder, set the edition size, and the studio assembles every artwork — artwork files and metadata, ready to mint.",
        steps: {
          upload: "Upload your layer folders",
          set: "Choose the edition size",
          done: "Download artwork and metadata",
        },
        cta: "See how it works",
      },
      closing: {
        title: "Take a piece of Voidline home",
        subtitle:
          "Every piece is drawn by hand in this studio. Mint yours right here — no need to go anywhere else.",
        cta: "Browse collections",
      },
    },

    about: {
      hero: {
        kicker: "The Studio",
        title: "A drawing style that only exists here",
        lead:
          "Voidline is a drawing style built from living dots and lines — drawn in our three favourite colours: red, black and white.",
      },
      style: {
        title: "Living dots and lines",
        body:
          "Every Voidline artwork is assembled from dots and lines that are given movement. Nothing is still: the dots drift, the lines stretch, and the drawing keeps breathing from the first frame to the last.",
        swatches: {
          red: "Red",
          black: "Black",
          white: "White",
        },
        note: "Three colours, held to without compromise.",
      },
      focus: {
        title: "Looping animated GIFs",
        body:
          "We focus on looping animated GIFs. A loop has no beginning and no end — it is a drawing that never stops moving, and it is the form we keep returning to.",
        body2:
          "We make that work consistently as Voidline NFT art: minted on the XRP Ledger, carried on to whoever collects it.",
      },
      invitation: {
        title: "Welcome to our island",
        body:
          "Enjoy your adventure on our island — and take a piece of it with you.",
        ctaCollections: "Explore collections",
        ctaGenerate: "Try the generator",
      },
    },
  },

  id: {
    nav: {
      home: "Atrium",
      collection: "Koleksi",
      generate: "Komposisi",
      about: "Studio",
      contact: "Kanal",
      buyNow: "Beli Sekarang",
      menu: "Menu",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
      skipToContent: "Lompat ke isi",
      composeComingSoon: "Generator belum dibuka.",
    },

    footer: {
      rights: "Seluruh hak dilindungi.",
      tagline: "Merah · Hitam · Putih",
    },

    page: {
      home: {
        title: "Atrium",
        subtitle: "Konten halaman utama akan ditambahkan di sini.",
      },
      collection: {
        title: "Koleksi",
        subtitle: "Semua koleksi Voidline Island di satu tempat. Mint langsung di sini — tanpa perlu keluar dari situs.",
      },
      newCollection: {
        title: "Koleksi Terbaru",
        subtitle: "Rilis terbaru dari Voidline Island — langsung dari XRP Ledger, diperbarui otomatis.",
      },
      generate: {
        title: "Komposisi",
        kicker: "Buat Sendiri",
        lead:
          "Unggah folder layer milikmu dan studio akan menyusun setiap karyanya — gambar jadi beserta metadata, siap di-mint di XRP Ledger.",
        privacy: "Semuanya berjalan di browser. Gambarmu tidak pernah keluar dari perangkatmu.",
        saved: "Tersimpan di perangkat ini",
        savedAt: "Tersimpan di perangkat ini pukul {waktu}",
        saveFailed:
          "Proyek gagal disimpan — penyimpanan browser mungkin penuh. Ekspor ZIP untuk menjaga hasil kerja.",
        restoring: "Memuat proyek tersimpan…",
        errors: {
          unsupportedSize: "Format berkas tidak didukung atau ukurannya lebih dari 10 MB.",
          noUsableFiles: "Tidak ada berkas yang bisa dipakai.",
          skipped:
            "{jumlah} berkas dilewati karena format tidak didukung atau lebih dari 10 MB.",
          unreadableFile: "Satu berkas tidak bisa dibaca dan belum bisa dipakai.",
          exampleFailed: "Proyek contoh gagal dimuat.",
        },
        startNew: "Mulai proyek baru",
        startNewConfirm:
          "Hapus proyek tersimpan beserta semua gambarnya dari browser ini? Tindakan ini tidak bisa dibatalkan.",
        addLayer: "Tambah layer",
        build: "Buat koleksi",
        generating: "Menyusun {selesai} dari {total}…",
        cancel: "Batalkan",
        cancelled: "Generate dibatalkan. Tidak ada yang disimpan.",
        blocked: "Tambahkan minimal satu layer berisi trait untuk bisa membuat koleksi.",
        ctaExample: "Lihat koleksi yang sudah jadi",
        closingTitle: "Coba dengan karya Anda sendiri",
        closingBody:
          "Tidak ada yang diunggah dan tidak ada yang ditagih. Terus susun layer sampai pratinjaunya terasa pas.",
        flow: {
          kicker: "Cara pakai",
          title: "Empat langkah dari karya ke koleksi",
        },
        steps: {
          upload: {
            title: "Tambahkan layer",
            body: "Ketik nama layer lalu masukkan gambarnya — background, head, body, hand, dan seterusnya.",
          },
          order: {
            title: "Atur urutan tumpukan",
            body: "Layer paling atas dalam daftar digambar terakhir, menimpa yang lain. Naikkan atau turunkan sampai hasilnya benar.",
          },
          rarity: {
            title: "Atur rarity",
            body: "Beri bobot pada tiap trait. Bobot lebih besar muncul lebih sering. Bobot nol mematikan trait itu.",
          },
          build: {
            title: "Buat lalu unduh",
            body: "Tentukan jumlah edition, buat koleksinya, lalu unduh satu ZIP berisi semua gambar dan metadatanya.",
          },
        },
        details: {
          orderTitle: "Layer mana yang di depan?",
          orderBody:
            "Daftar dibaca dari depan ke belakang: layer paling atas digambar terakhir dan menutupi layer di bawahnya. Background di paling bawah, head dan hand di dekat atas.",
          filesTitle: "Berkas gambar apa yang bisa dipakai?",
          filesBody:
            "PNG, JPEG, WebP, GIF, atau SVG, maksimal 10 MB per berkas. PNG transparan paling baik untuk layer di atas background. Beri nama berkas yang mudah dibaca — nama itu menjadi nama trait di metadata.",
        },
        cta: {
          title: "Siap membuat koleksi?",
          body: "Masuk ke area studio untuk mengunggah layermu dan membuat koleksi pertamamu.",
          start: "Mulai generate",
          example: "Lihat koleksi yang sudah jadi",
          needAccount: "Sistem akun belum dibuka",
        },
      },
      generator: {
        newLayerName: "Layer baru",
        projectName: "Nama proyek",
        projectNamePlaceholder: "Proyek tanpa nama",
        layersTitle: "Layer",
        layersHint: "Daftar dibaca dari depan ke belakang — layer paling atas digambar terakhir, menimpa yang lain.",
        noLayersTitle: "Belum ada layer",
        noLayersBody: "Mulai dengan menambah satu layer, lalu masukkan gambarnya.",
        start: {
          title: "Mulai dari kanvas kosong",
          body: "Tiga jalan masuk. Pilih yang paling cocok dengan berkas yang sudah Anda siapkan — semuanya tetap di browser ini.",
          uploadTitle: "Unggah gambar",
          uploadBody: "Pilih berkasnya; layer dibentuk otomatis dari nama berkas.",
          demoTitle: "Muat koleksi contoh",
          demoBody: "Empat layer siap pakai. Cocok untuk mencoba mesinnya lebih dulu.",
          loadingDemo: "Menyusun contoh…",
          manualTitle: "Susun sendiri",
          manualBody: "Beri nama layer dulu, lalu masukkan gambarnya satu per satu.",
        },
        dismiss: "Tutup",
        preview: {
          title: "Pratinjau langsung",
          shuffle: "Acak ulang",
          empty: "Tambahkan layer dan trait untuk melihat pratinjau.",
          canvasLabel: "Pratinjau hasil kombinasi",
          loading: "Menggambar pratinjau…",
          failed: "Pratinjau gagal digambar. Coba acak ulang, atau periksa apakah berkas gambarnya bisa dibaca.",
        },
        dropzone: {
          loading: "Membaca berkas…",
        },
        layer: {
          collapse: "Ciutkan layer",
          expand: "Buka layer",
          nameLabel: "Nama layer",
          moveForward: "Naikkan layer",
          moveBackward: "Turunkan layer",
          delete: "Hapus layer",
          emptyTitle: "Letakkan gambar di sini",
          emptyBody: "Atau klik untuk memilih berkas",
          addMore: "Tambah gambar lain",
          position: "Layer {posisi} dari {total}",
        },
        trait: {
          include: "Pakai dalam generate",
          exclude: "Kecualikan dari generate",
          nameLabel: "Nama trait",
          weightLabel: "Bobot",
          weightHint: "Bobot lebih besar muncul lebih sering. 0 mematikan trait ini.",
          delete: "Hapus trait",
        },
        settings: {
          title: "Pengaturan koleksi",
          collectionName: "Nama koleksi",
          collectionNamePlaceholder: "Mom Apes Voidline",
          namePreview: "Item akan diberi nama {contoh}",
          untitled: "Tanpa nama",
          editionSize: "Jumlah edition",
          startTokenId: "Nomor awal",
          outputSize: "Ukuran gambar",
          outputSizeHint: "Tiap karya {sisi} × {sisi} px. Layer diskalakan agar muat tanpa gepeng.",
          noLayers: "Tambahkan layer untuk melihat berapa kombinasi yang mungkin.",
          layerEmpty: "Setiap layer butuh minimal satu trait aktif sebelum bisa di-generate.",
          combinations: "{jumlah} kombinasi unik tersedia.",
          combinationsShort: "Hanya {jumlah} kombinasi unik — lebih sedikit dari jumlah edition, jadi sebagian item akan kembar.",
        },
        results: {
          kicker: "Koleksi siap",
          title: "Karya hasil generate",
          summary: "{jumlah} item berukuran {lebar} × {tinggi} px. Unduh satu per satu, atau ambil seluruhnya.",
          downloadOne: "Unduh {nama} sebagai PNG",
          downloadZip: "Unduh ZIP",
          zipping: "Menyusun…",
          edit: "Sunting",
          editItem: "Sunting {nama}",
          lock: "Kunci item",
          unlock: "Buka kunci item",
          locked: "Terkunci",
          lockedCount: "{terkunci} dari {total} terkunci",
          lockAll: "Kunci semua",
          unlockAll: "Buka semua",
          renumber: "Nomori ulang",
          renumberHint: "Beri nomor berurutan mulai dari nomor awal di pengaturan koleksi.",
          reroll: "Ker ulang",
          remove: "Ganti",
          wouldDuplicate: "Pilihan ini akan membuat item kembar",
          errDuplicate: "Perubahan itu akan membuat item ini kembar dengan item lain. Tidak ada yang berubah.",
          errLocked: "Item ini terkunci. Buka kuncinya lebih dulu untuk menyunting.",
          errExhausted: "Semua kombinasi yang mungkin sudah terpakai. Tidak ada yang berubah.",
          errMissing: "Item itu tidak ditemukan. Tidak ada yang berubah.",
        },
        errors: {
          notEnough: "Kombinasi unik hanya {tersedia}, sedangkan yang diminta {diminta}. Kurangi jumlah edition atau tambah trait.",
          missingFiles: "{nama}: gambarnya tidak bisa dibaca, jadi tidak ikut dalam hasil.",
          failed: "Generate berhenti: {pesan}",
        },
      },
      notFound: {
        title: "Halaman ini tidak ada",
        body: "Alamatnya mungkin sudah berubah atau salah ketik. Sisanya masih di tempat semula.",
        home: "Kembali ke beranda",
        collection: "Lihat koleksi",
      },
      error: {
        title: "Ada yang tidak berjalan di halaman ini",
        body: "Halamannya gagal ditampilkan. Memuat ulang biasanya membereskan ini — tidak ada yang Anda simpan ikut hilang.",
        home: "Kembali ke beranda",
      },
      about: {
        title: "Studio",
        subtitle: "Informasi tentang studio akan ditambahkan di sini.",
      },
      contact: {
        title: "Kanal",
        kicker: "Hubungi Studio",
        subtitle: "Detail kontak akan ditambahkan di sini.",
        lead:
          "Dua hal yang kami kerjakan: karya pesanan untuk kolektor, dan jasa studio untuk kreator lain — seni PNG, GIF animasi, situs web, serta pemasangan generator lengkap dengan metadata.",
        status: {
          open: "Menerima pekerjaan baru",
          terms: "Lingkup dan ketentuan disepakati di awal",
          reply: "Dibalas dalam satu sampai dua hari kerja",
        },
        commission: {
          num: "01 — Pesanan",
          title: "Karya khusus, dibuat untuk Anda",
          body:
            "Satu karya atau seri pendek dengan gaya Voidline — merah, hitam, putih, dibangun dari titik dan garis yang bergerak. Sebutkan untuk apa karyanya, lingkupnya disepakati sebelum apa pun digambar.",
          cta: "Mulai pesanan",
          chips: {
            single: "Satu karya",
            series: "Seri",
            commercial: "Pemakaian komersial",
            revenue: "Bagi hasil",
          },
        },
        services: {
          title: "Jasa studio",
          sub:
            "Hal yang sama kami bangun untuk koleksi sendiri, untuk kreator yang lebih memilih bekerja bersama kami daripada mulai dari nol.",
          foot:
            "Daftarnya bisa bertambah. Kalau yang Anda butuhkan belum ada di sini, tanyakan — kami akan menjawab terus terang sanggup atau tidak.",
          items: {
            png: {
              name: "Seni PNG",
              note: "Karya gambar tangan, diserahkan dalam resolusi penuh.",
            },
            gif: {
              name: "GIF animasi",
              note: "Animasi berulang — bentuk yang paling kami kuasai.",
            },
            web: {
              name: "Situs web",
              note: "Situs seperti ini, dibangun dan diserahkan siap jalan.",
            },
            generator: {
              name: "Generator & metadata",
              note: "Generator koleksi berlapis lengkap dengan metadata, diisi dari contoh yang Anda berikan.",
            },
          },
        },
        before: {
          title: "Sebelum menulis",
          steps: {
            "1": {
              title: "Sebutkan untuk apa",
              body:
                "Koleksi, karya pribadi, produk, atau situs. Tujuannya menentukan bentuk karyanya, jadi lebih baik disepakati lebih dulu.",
            },
            "2": {
              title: "Kirim satu dua acuan",
              body:
                "Apa pun yang menunjukkan arah — karya kami atau karya orang lain. Satu gambar menghemat satu paragraf penjelasan.",
            },
            "3": {
              title: "Sebutkan tenggatnya",
              body:
                "Kami bekerja berdasarkan tenggat, bukan jam tetap. Tanggal yang pasti langsung memberi tahu apakah pekerjaannya masuk.",
            },
          },
        },
        policy: {
          nft: {
            title: "Membeli NFT",
            body:
              "Setiap koleksi di-mint di XRP Ledger dan di-mint langsung di halamannya sendiri. Mint tidak lewat pesan — lihat",
            link: "koleksinya",
          },
          karya: {
            title: "Pemakaian karya koleksi",
            body:
              "Koleksi ini karya pribadi, bukan stok. Kalau Anda memiliki sebuah karya, Anda boleh menjual ulang atau memindahkannya; selain itu perlu kesepakatan tertulis lebih dulu.",
          },
          kolaborasi: {
            title: "Kolaborasi",
            body:
              "Pameran, wawancara, dan proyek bersama kami terima. Jelaskan bentuk idenya dan apa yang Anda harapkan dari studio, kami balas dengan apa yang bisa kami tawarkan.",
          },
        },
        channels: {
          title: "Tulis ke kami",
          discordLabel: "Discord — jalur tercepat",
          discordName: "Voidline Island",
          discordCta: "Buka Discord",
          x: "X",
          instagram: "Instagram",
          threads: "Threads",
        },
        studio: {
          title: "Tentang studio",
          body:
            "Gaya gambar yang dibangun dari titik dan garis hidup, dijaga pada tiga warna tanpa kompromi. Kami membuat GIF animasi berulang, meng-mint-nya di XRP Ledger, dan membangun alat supaya orang lain bisa melakukannya juga.",
          cta: "Kisah studio →",
        },
        replyNote: "Studio membalas dalam satu sampai dua hari kerja.",
      },
    },

    collection: {
      mintNow: "Mint Sekarang",
      viewCollection: "Lihat koleksi",
      mintHere: "Mint di xrp.cafe",
      mintOutside: "Mint untuk koleksi ini belum tersedia di sini — karyanya bisa dilihat di xrp.cafe.",
      viewOnXrpCafe: "Lihat di xrp.cafe",
      back: "Kembali ke koleksi",
      imageSoon: "Karya segera hadir",
      count: "{count} koleksi",
      works: "{count} karya",
      allWorks: "Semua karya",
      loadingArt: "Memuat karya…",
      artFailed: "Karya gagal dimuat dari IPFS.",
      mintLabel: "Mint di XRPL",
      standardLabel: "Standar XRPL",
      standardNote:
        "Setiap koleksi Voidline di-mint di XRP Ledger dengan standar XLS-20 — aturan yang sama untuk setiap karya, siapa pun yang meng-mint-nya.",
      standardCta: "Tentang studio",
      loading: "Memuat mint…",
      loadFailed:
        "Kotak mint gagal dimuat. Buka langsung di xrp.cafe lewat tautan di bawah.",
      mintNote: "Pakai GemWallet? Mint langsung di",
      notFound: {
        title: "Koleksi tidak ditemukan",
        subtitle: "Koleksi yang kamu cari tidak ada atau sudah tidak tersedia.",
      },
      workNotFound: "Karya ini tidak ada atau sudah tidak terdaftar.",
      newCollectionLabel: "Koleksi terbaru",
      newCollectionEmpty:
        "Belum ada koleksi baru yang tayang. Rilis terbaru akan muncul di sini otomatis begitu di-mint.",
      newCollectionBrowse: "Jelajahi semua koleksi",
      soldOut: "Sudah laku",
      available: "Tersedia",
      soldOutNote: "Karya ini sudah punya pemilik. Karyanya tetap bisa dilihat di xrp.cafe.",
      tokenId: "NFTokenID",
      apes: {
        title: "Apes Voidline",
        subtitle: "Koleksi Apes Voidline dari Voidline Island.",
      },
      jajang: {
        title: "Jajang Voidline",
        subtitle: "Koleksi Jajang Voidline dari Voidline Island.",
      },
      fineart: {
        title: "Fine Art Voidline",
        subtitle: "Koleksi Fine Art Voidline dari Voidline Island.",
      },
      filterLabel: "Koleksi",
      searchLabel: "Cari karya",
      searchPlaceholder: "Cari judul atau nomor edisi…",
      allCollections: "Semua koleksi ({count})",
      noMatch: "Tidak ada karya yang cocok.",
      kelompok: {
        apid: "Apes Voidline",
        favo: "Fine Art Voidline",
        javo: "Jajang Voidline",
        neo: "Neo",
        lepas: "Karya lepas",
        puko: "Pukonimichi",
      },
    },

    sorotan: {
      kicker: "Karya Pilihan",
      judul: "Karya yang layak dilihat dua kali",
      ket:
        "Beberapa karya dari album terbaru, dipilih satu per satu. Sisanya tetap ada di xrp.cafe.",
      lihatSemua: "Lihat album lengkap",
      segera: "Segera",
      misteri: "Belum dibuka",
      sebelumnya: "Karya sebelumnya",
      berikutnya: "Karya berikutnya",
      keKarya: "Ke karya {n}",
      "1": { judul: "Cahaya Pertama", catatan: "1 dari 1" },
      "2": { judul: "Garis Merah", catatan: "Legendaris" },
      "3": { judul: "Ruang Sunyi", catatan: "Langka" },
      "4": { judul: "Mekar Statis", catatan: "1 dari 1" },
      "5": { judul: "Ledger Malam", catatan: "Legendaris" },
      "6": { judul: "Nada Separo", catatan: "Langka" },
      "7": { judul: "Sayat Kertas", catatan: "Tidak Umum" },
      "8": { judul: "Bingkai Terakhir", catatan: "1 dari 1" },
      "9": { judul: "Matahari Kedua", catatan: "Langka" },
      "10": { judul: "Rancangan Malam", catatan: "Tidak Umum" },
    },

    home: {
      hero: {
        badge: "Selamat Datang di Galeri NFT Jajang Osle",
        title: "NFT GIF Animation",
        subtitle:
          "Voidline adalah seni animasi gif yang dibuat frame by brame dengan menghidupkan gerakan titik dan garis",
        ctaCollections: "Jelajahi Koleksi",
        ctaLatestCollection: "Koleksi terbaru",
      },
      stats: {
        collections: "Koleksi",
        artworks: "Karya",
        standard: "Standar XRPL",
        standardValue: "XLS-20",
      },
      rilis: {
        badge: "Rilis hari ini",
        title: "Mom Ape — koleksi terbaru rilis hari ini",
        subtitle:
          "Koleksi Voidline terbaru sudah tayang di xrp.cafe. Ambil milikmu selama masa rilis dibuka.",
        cta: "Mint di xrp.cafe",
        pengantar:
          "Semua jendela klaim, tiap batch, dan seluruh karya dalam rilis ini ada di satu halaman — buka untuk melihat mana yang jadi hakmu.",
        ajakan: "Lihat detail rilis",
      },
      collections: {
        kicker: "Karyanya",
        title: "Koleksi Unggulan",
        subtitle:
          "Setiap koleksi digambar dengan tangan dan di-mint langsung dari situs ini — tanpa perlu pindah tempat.",
        viewAll: "Lihat semua koleksi",
      },
      gallery: {
        kicker: "Karya Terbaru",
        title: "Segar dari ledger",
        subtitle:
          "Gulungan karya dari setiap koleksi — semuanya hidup di XRP Ledger dan bisa di-mint langsung dari situs ini.",
        cta: "Lihat semua 654 karya",
      },
      generate: {
        kicker: "Alatnya",
        title: "Buat koleksimu sendiri",
        subtitle:
          "Upload folder layer milikmu, tentukan jumlah edisi, dan studio menyusun setiap karyanya — file gambar beserta metadata, siap di-mint.",
        steps: {
          upload: "Upload folder layer milikmu",
          set: "Tentukan jumlah edisi",
          done: "Unduh gambar dan metadata",
        },
        cta: "Lihat cara kerjanya",
      },
      closing: {
        title: "Bawa pulang sepotong Voidline",
        subtitle:
          "Setiap karya digambar tangan di studio ini. Mint langsung di sini — tanpa perlu pindah tempat.",
        cta: "Jelajahi koleksi",
      },
    },

    about: {
      hero: {
        kicker: "Studionya",
        title: "Gaya menggambar yang hanya ada di sini",
        lead:
          "Voidline adalah gaya menggambar yang dibuat dengan elemen titik dan garis yang hidup — digambar dalam tiga warna favorit kami: merah, hitam dan putih.",
      },
      style: {
        title: "Titik dan garis yang hidup",
        body:
          "Setiap karya Voidline disusun dari titik dan garis yang diberi gerak. Tidak ada yang diam: titiknya berpindah, garisnya meregang, dan gambarnya terus bernapas dari frame pertama sampai terakhir.",
        swatches: {
          red: "Merah",
          black: "Hitam",
          white: "Putih",
        },
        note: "Tiga warna, dipegang tanpa kompromi.",
      },
      focus: {
        title: "GIF animasi looping",
        body:
          "Kami berfokus dalam mengembangkan GIF animasi looping. Sebuah loop tidak punya awal dan tidak punya akhir — ia gambar yang tidak pernah berhenti bergerak, dan itulah bentuk yang terus kami ulang.",
        body2:
          "Kami konsisten membuat karya tersebut dalam bentuk NFT art Voidline: di-mint di XRP Ledger, lalu diteruskan kepada siapa pun yang mengoleksinya.",
      },
      invitation: {
        title: "Selamat berpetualang di pulau kami",
        body:
          "Nikmati petualangan di pulau kami — dan bawa sepotong darinya pulang.",
        ctaCollections: "Jelajahi koleksi",
        ctaGenerate: "Coba generator",
      },
    },
  },
} as const;

export type Language = keyof typeof translations;

/** Kunci bahasa yang tersedia. */
export const languages: Language[] = ["en", "id"];

/** Kode bahasa disimpan di localStorage dengan kunci ini. */
export const LANGUAGE_STORAGE_KEY = "language";

/** Bahasa yang dipakai bila belum ada pilihan tersimpan. */
export const DEFAULT_LANGUAGE: Language = "en";
