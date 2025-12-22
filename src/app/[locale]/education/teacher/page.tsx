import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Portal del Profesor - Atlas de Árboles de Costa Rica"
        : "Teacher Dashboard - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Recursos, guías y materiales para profesores que utilizan el Atlas de Árboles de Costa Rica."
        : "Resources, guides, and materials for teachers using the Costa Rica Tree Atlas.",
  };
}

export default async function TeacherDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees.filter((t) => t.locale === locale);
  const families = [...new Set(trees.map((t) => t.family))];
  const treeCount = trees.length;
  const familyCount = families.length;

  const t = {
    title: locale === "es" ? "Portal del Profesor" : "Teacher Dashboard",
    subtitle:
      locale === "es"
        ? "Todo lo que necesitas para enseñar sobre los árboles de Costa Rica"
        : "Everything you need to teach about Costa Rica's trees",
    backToEducation:
      locale === "es" ? "← Volver a Educación" : "← Back to Education",
    quickStart: locale === "es" ? "Guía de Inicio Rápido" : "Quick Start Guide",
    quickStartDesc:
      locale === "es"
        ? "Comienza a usar el atlas en tu aula en 5 minutos"
        : "Start using the atlas in your classroom in 5 minutes",
    lessonPlans: locale === "es" ? "Planes de Lección" : "Lesson Plans",
    lessonPlansDesc:
      locale === "es"
        ? "4 lecciones completas alineadas con estándares educativos"
        : "4 complete lessons aligned with educational standards",
    printables:
      locale === "es" ? "Materiales Imprimibles" : "Printable Materials",
    printablesDesc:
      locale === "es"
        ? "Tarjetas, listas de verificación y hojas de actividades"
        : "Flashcards, checklists, and activity sheets",
    classroom: locale === "es" ? "Gestión de Aula" : "Classroom Management",
    classroomDesc:
      locale === "es"
        ? "Crea un aula virtual y monitorea el progreso"
        : "Create a virtual classroom and monitor progress",
    curriculum:
      locale === "es" ? "Alineación Curricular" : "Curriculum Alignment",
    curriculumDesc:
      locale === "es"
        ? "Cómo el atlas se alinea con los estándares educativos"
        : "How the atlas aligns with educational standards",
    fieldTrips: locale === "es" ? "Excursiones de Campo" : "Field Trips",
    fieldTripsDesc:
      locale === "es"
        ? "Herramientas y guías para excursiones de naturaleza"
        : "Tools and guides for nature field trips",
    assessments: locale === "es" ? "Evaluaciones" : "Assessments",
    assessmentsDesc:
      locale === "es"
        ? "Quizzes y rúbricas para evaluar el aprendizaje"
        : "Quizzes and rubrics to assess learning",
    resources:
      locale === "es" ? "Recursos Adicionales" : "Additional Resources",
    viewAll: locale === "es" ? "Ver Todo →" : "View All →",
    download: locale === "es" ? "Descargar" : "Download",
    species: locale === "es" ? "Especies" : "Species",
    families: locale === "es" ? "Familias" : "Families",
    lessons: locale === "es" ? "Lecciones" : "Lessons",
    standards: locale === "es" ? "Estándares" : "Standards",
    meaCR: "MEP Costa Rica",
    ngss: "NGSS (USA)",
    stepByStep: locale === "es" ? "Paso a Paso" : "Step by Step",
    step1:
      locale === "es"
        ? "Explora el directorio de árboles"
        : "Explore the tree directory",
    step2:
      locale === "es"
        ? "Selecciona una lección para tu nivel"
        : "Select a lesson for your grade level",
    step3:
      locale === "es"
        ? "Imprime los materiales necesarios"
        : "Print the necessary materials",
    step4:
      locale === "es"
        ? "Crea un aula virtual (opcional)"
        : "Create a virtual classroom (optional)",
    step5:
      locale === "es"
        ? "¡Comienza la lección con tus estudiantes!"
        : "Start the lesson with your students!",
    answerKeys: locale === "es" ? "Claves de Respuesta" : "Answer Keys",
    answerKeysDesc:
      locale === "es"
        ? "Respuestas para todas las actividades y quizzes"
        : "Answers for all activities and quizzes",
    extensions:
      locale === "es" ? "Actividades de Extensión" : "Extension Activities",
    extensionsDesc:
      locale === "es"
        ? "Ideas para profundizar el aprendizaje"
        : "Ideas to deepen learning",
    gradeLevel: locale === "es" ? "Nivel" : "Grade",
    duration: locale === "es" ? "Duración" : "Duration",
    minutes: locale === "es" ? "min" : "min",
    downloadPDF: locale === "es" ? "📄 Descargar PDF" : "📄 Download PDF",
    comingSoon: locale === "es" ? "Próximamente" : "Coming Soon",
  };

  const lessonData = [
    {
      id: "biodiversity-intro",
      icon: "🌿",
      title:
        locale === "es"
          ? "Introducción a la Biodiversidad"
          : "Introduction to Biodiversity",
      grades: "3-5",
      duration: 45,
      standards: ["MEP-CN-3.1", "NGSS-3-LS4-3"],
    },
    {
      id: "tree-identification",
      icon: "🔍",
      title:
        locale === "es" ? "Identificación de Árboles" : "Tree Identification",
      grades: "4-8",
      duration: 60,
      standards: ["MEP-CN-4.2", "NGSS-4-LS1-1"],
    },
    {
      id: "conservation",
      icon: "🛡️",
      title:
        locale === "es"
          ? "Conservación y Amenazas"
          : "Conservation and Threats",
      grades: "6-12",
      duration: 90,
      standards: ["MEP-CN-6.3", "NGSS-MS-LS2-4"],
    },
    {
      id: "ecosystem-services",
      icon: "🌍",
      title: locale === "es" ? "Servicios Ecosistémicos" : "Ecosystem Services",
      grades: "7-12",
      duration: 60,
      standards: ["MEP-CN-7.1", "NGSS-MS-LS2-5"],
    },
  ];

  const answerKeys = [
    {
      lesson: locale === "es" ? "Quiz de Biodiversidad" : "Biodiversity Quiz",
      answers:
        locale === "es"
          ? ["5%", "Ecosistemas, medicina y aire limpio", "Correcto", "0.03%"]
          : ["5%", "Ecosystems, medicine, and clean air", "Correct", "0.03%"],
    },
    {
      lesson:
        locale === "es" ? "Quiz de Identificación" : "Identification Quiz",
      answers:
        locale === "es"
          ? [
              "Por hojas, corteza, flores y frutos",
              "La familia botánica",
              "Observación sistemática",
            ]
          : [
              "By leaves, bark, flowers, and fruits",
              "The botanical family",
              "Systematic observation",
            ],
    },
    {
      lesson: locale === "es" ? "Quiz de Conservación" : "Conservation Quiz",
      answers:
        locale === "es"
          ? [
              "Deforestación, incendios, cambio climático",
              "Parques nacionales y reservas",
              "25% del territorio",
            ]
          : [
              "Deforestation, fires, climate change",
              "National parks and reserves",
              "25% of territory",
            ],
    },
  ];

  const extensionIdeas =
    locale === "es"
      ? [
          {
            icon: "🎨",
            title: "Proyecto de Arte",
            desc: "Los estudiantes crean un mural de un árbol nativo con todas sus características",
          },
          {
            icon: "📝",
            title: "Diario de Naturaleza",
            desc: "Observar y documentar un árbol durante un mes completo",
          },
          {
            icon: "🎭",
            title: "Dramatización",
            desc: "Representar el ciclo de vida de un árbol o la cadena alimenticia",
          },
          {
            icon: "📊",
            title: "Investigación",
            desc: "Comparar árboles de Costa Rica con árboles de otros países",
          },
          {
            icon: "🌱",
            title: "Proyecto de Siembra",
            desc: "Germinar y cuidar una plántula de árbol nativo",
          },
          {
            icon: "📱",
            title: "Tecnología",
            desc: "Crear una presentación digital sobre un árbol favorito",
          },
        ]
      : [
          {
            icon: "🎨",
            title: "Art Project",
            desc: "Students create a mural of a native tree with all its features",
          },
          {
            icon: "📝",
            title: "Nature Journal",
            desc: "Observe and document a tree for a full month",
          },
          {
            icon: "🎭",
            title: "Role Play",
            desc: "Act out the life cycle of a tree or a food chain",
          },
          {
            icon: "📊",
            title: "Research",
            desc: "Compare Costa Rica trees with trees from other countries",
          },
          {
            icon: "🌱",
            title: "Planting Project",
            desc: "Germinate and care for a native tree seedling",
          },
          {
            icon: "📱",
            title: "Technology",
            desc: "Create a digital presentation about a favorite tree",
          },
        ];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link
          href="/education"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          {t.backToEducation}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              👩‍🏫
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-primary">{treeCount}</div>
            <div className="text-sm text-muted-foreground">{t.species}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-primary">{familyCount}</div>
            <div className="text-sm text-muted-foreground">{t.families}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">{t.lessons}</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="text-3xl font-bold text-primary">2</div>
            <div className="text-sm text-muted-foreground">{t.standards}</div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 p-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span>🚀</span> {t.quickStart}
            </h2>
            <p className="text-muted-foreground mb-6">{t.quickStartDesc}</p>

            <div className="grid md:grid-cols-5 gap-4">
              {[t.step1, t.step2, t.step3, t.step4, t.step5].map((step, i) => (
                <div
                  key={i}
                  className="bg-background/50 rounded-xl p-4 relative"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm mt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className="mb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/education/lessons"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {t.lessonPlans}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.lessonPlansDesc}
              </p>
            </Link>

            <Link
              href="/education/printables"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">🖨️</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {t.printables}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.printablesDesc}
              </p>
            </Link>

            <Link
              href="/education/classroom"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {t.classroom}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.classroomDesc}
              </p>
            </Link>

            <Link
              href="/education/field-trip"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">🥾</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {t.fieldTrips}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.fieldTripsDesc}
              </p>
            </Link>

            <Link
              href="/education/map-game"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {locale === "es" ? "Juego del Mapa" : "Map Game"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {locale === "es"
                  ? "Juego interactivo sobre regiones de Costa Rica"
                  : "Interactive game about Costa Rica regions"}
              </p>
            </Link>

            <Link
              href="/education/certificate"
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {locale === "es" ? "Certificados" : "Certificates"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {locale === "es"
                  ? "Genera certificados de logros para estudiantes"
                  : "Generate achievement certificates for students"}
              </p>
            </Link>
          </div>
        </section>

        {/* Lesson Plans Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📋</span> {t.lessonPlans}
          </h2>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left font-medium">
                      {locale === "es" ? "Lección" : "Lesson"}
                    </th>
                    <th className="px-6 py-4 text-center font-medium">
                      {t.gradeLevel}
                    </th>
                    <th className="px-6 py-4 text-center font-medium">
                      {t.duration}
                    </th>
                    <th className="px-6 py-4 text-center font-medium">
                      {t.standards}
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      {locale === "es" ? "Acción" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lessonData.map((lesson) => (
                    <tr
                      key={lesson.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lesson.icon}</span>
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {lesson.grades}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {lesson.duration} {t.minutes}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {lesson.standards.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-muted text-xs rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/education/lessons/${lesson.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          {t.viewAll}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Answer Keys */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🔑</span> {t.answerKeys}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {answerKeys.map((key, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="font-semibold mb-4">{key.lesson}</h3>
                <ol className="space-y-2 text-sm">
                  {key.answers.map((answer, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-green-500/20 text-green-700 rounded-full flex items-center justify-center text-xs shrink-0">
                        {j + 1}
                      </span>
                      <span className="text-muted-foreground">{answer}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum Alignment */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📚</span> {t.curriculum}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🇨🇷</span>
                <div>
                  <h3 className="font-semibold">{t.meaCR}</h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === "es"
                      ? "Ministerio de Educación Pública"
                      : "Ministry of Public Education"}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {locale === "es"
                    ? "Ciencias Naturales: Biodiversidad"
                    : "Natural Sciences: Biodiversity"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {locale === "es"
                    ? "Estudios Sociales: Geografía"
                    : "Social Studies: Geography"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {locale === "es"
                    ? "Educación Ambiental"
                    : "Environmental Education"}
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🇺🇸</span>
                <div>
                  <h3 className="font-semibold">{t.ngss}</h3>
                  <p className="text-sm text-muted-foreground">
                    Next Generation Science Standards
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  LS2: Ecosystems - Interactions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  LS4: Biological Evolution - Biodiversity
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  ESS3: Earth and Human Activity
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Extension Activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💡</span> {t.extensions}
          </h2>
          <p className="text-muted-foreground mb-6">{t.extensionsDesc}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {extensionIdeas.map((idea, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="text-3xl mb-2">{idea.icon}</div>
                <h3 className="font-semibold mb-1">{idea.title}</h3>
                <p className="text-sm text-muted-foreground">{idea.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Resources */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📎</span> {t.resources}
          </h2>

          <div className="bg-muted/50 rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border opacity-60 cursor-not-allowed">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-sm">
                    {locale === "es" ? "Guía del Profesor" : "Teacher Guide"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF • {t.comingSoon}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border opacity-60 cursor-not-allowed">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium text-sm">
                    {locale === "es" ? "Rúbricas" : "Rubrics"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF • {t.comingSoon}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border opacity-60 cursor-not-allowed">
                <span className="text-2xl">🎬</span>
                <div>
                  <div className="font-medium text-sm">
                    {locale === "es" ? "Videos" : "Videos"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.comingSoon}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border opacity-60 cursor-not-allowed">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-medium text-sm">
                    {locale === "es" ? "Presentaciones" : "Slides"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.comingSoon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
