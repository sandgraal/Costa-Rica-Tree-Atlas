"use client";

import { useState } from "react";
import { Link } from "@i18n/navigation";

interface DiagnoseClientProps {
  locale: string;
}

type SymptomCategory = "leaves" | "bark" | "branches" | "roots" | "whole-tree";
type Symptom = string;

interface Diagnosis {
  problem: string;
  description: string;
  causes: string[];
  treatments: string[];
  whenToCallProfessional: string;
  severity: "low" | "moderate" | "high";
}

export default function DiagnoseClient({ locale }: DiagnoseClientProps) {
  const [step, setStep] = useState<"category" | "symptom" | "result">(
    "category"
  );
  const [selectedCategory, setSelectedCategory] =
    useState<SymptomCategory | null>(null);
  const [_selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: "Tree Health Diagnostic Tool",
        subtitle: "Identify tree problems and get treatment recommendations",
        selectCategory: "What part of the tree is affected?",
        leaves: "Leaves",
        bark: "Bark & Trunk",
        branches: "Branches",
        roots: "Roots",
        wholeTree: "Whole Tree",
        selectSymptom: "What symptoms do you see?",
        back: "← Back",
        restart: "Start Over",
        severityLow: "Low Severity",
        severityModerate: "Moderate Severity",
        severityHigh: "High Severity - Immediate Action Needed",
        problem: "Problem",
        description: "Description",
        causes: "Possible Causes",
        treatments: "Recommended Treatments",
        professional: "When to Call a Professional",
        disclaimer:
          "This tool provides general guidance. For valuable trees or severe problems, consult a certified arborist.",
        exploretrees: "Explore Tree Directory",
      },
      es: {
        title: "Herramienta de Diagnóstico de Salud de Árboles",
        subtitle:
          "Identifica problemas de árboles y recibe recomendaciones de tratamiento",
        selectCategory: "¿Qué parte del árbol está afectada?",
        leaves: "Hojas",
        bark: "Corteza y Tronco",
        branches: "Ramas",
        roots: "Raíces",
        wholeTree: "Árbol Completo",
        selectSymptom: "¿Qué síntomas observas?",
        back: "← Atrás",
        restart: "Comenzar de Nuevo",
        severityLow: "Severidad Baja",
        severityModerate: "Severidad Moderada",
        severityHigh: "Severidad Alta - Acción Inmediata Necesaria",
        problem: "Problema",
        description: "Descripción",
        causes: "Causas Posibles",
        treatments: "Tratamientos Recomendados",
        professional: "Cuándo Llamar a un Profesional",
        disclaimer:
          "Esta herramienta proporciona orientación general. Para árboles valiosos o problemas graves, consulta a un arborista certificado.",
        exploretrees: "Explorar Directorio de Árboles",
      },
    };
    return translations[locale][key] || key;
  };

  const getCategories = () => {
    return [
      {
        id: "leaves" as SymptomCategory,
        label: t("leaves"),
        icon: "🍃",
        description:
          locale === "es"
            ? "Problemas con hojas: color, forma, caída"
            : "Leaf problems: color, shape, dropping",
      },
      {
        id: "bark" as SymptomCategory,
        label: t("bark"),
        icon: "🪵",
        description:
          locale === "es"
            ? "Problemas de corteza y tronco"
            : "Bark and trunk issues",
      },
      {
        id: "branches" as SymptomCategory,
        label: t("branches"),
        icon: "🌿",
        description:
          locale === "es" ? "Problemas con ramas" : "Branch problems",
      },
      {
        id: "roots" as SymptomCategory,
        label: t("roots"),
        icon: "🌱",
        description: locale === "es" ? "Problemas de raíces" : "Root issues",
      },
      {
        id: "whole-tree" as SymptomCategory,
        label: t("wholeTree"),
        icon: "🌳",
        description:
          locale === "es"
            ? "Problemas generales del árbol"
            : "Overall tree health",
      },
    ];
  };

  const getSymptoms = (category: SymptomCategory) => {
    const symptoms: Record<SymptomCategory, string[]> = {
      leaves:
        locale === "es"
          ? [
              "Hojas amarillas (clorosis)",
              "Manchas marrones o negras",
              "Hojas marchitas o caídas",
              "Hojas masticadas o con agujeros",
              "Hojas enrolladas o deformadas",
              "Caída prematura de hojas",
            ]
          : [
              "Yellow leaves (chlorosis)",
              "Brown or black spots",
              "Wilting or drooping leaves",
              "Chewed or holes in leaves",
              "Curled or deformed leaves",
              "Premature leaf drop",
            ],
      bark:
        locale === "es"
          ? [
              "Corteza agrietada o pelada",
              "Supuración de savia",
              "Agujeros en la corteza",
              "Hongos o moho en el tronco",
              "Corteza suelta o desprendida",
              "Manchas oscuras en la corteza",
            ]
          : [
              "Cracked or peeling bark",
              "Sap oozing",
              "Holes in bark",
              "Fungi or mold on trunk",
              "Loose or falling bark",
              "Dark patches on bark",
            ],
      branches:
        locale === "es"
          ? [
              "Ramas muertas o secas",
              "Ramas quebradizas",
              "Crecimiento anormal",
              "Ramas débiles o colgantes",
              "Ramas con grietas",
            ]
          : [
              "Dead or dry branches",
              "Brittle branches",
              "Abnormal growth",
              "Weak or drooping branches",
              "Cracked branches",
            ],
      roots:
        locale === "es"
          ? [
              "Raíces expuestas",
              "Pudrición de raíces",
              "Hongos cerca de la base",
              "Árbol inclinado",
              "Suelo levantado",
            ]
          : [
              "Exposed roots",
              "Root rot",
              "Fungi near base",
              "Leaning tree",
              "Raised soil",
            ],
      "whole-tree":
        locale === "es"
          ? [
              "Crecimiento lento o atrofiado",
              "Árbol inclinado",
              "Pérdida general de vigor",
              "Sin hojas en temporada",
              "Infestación de plagas visible",
            ]
          : [
              "Slow or stunted growth",
              "Tree leaning",
              "General loss of vigor",
              "No leaves in season",
              "Visible pest infestation",
            ],
    };
    return symptoms[category] || [];
  };

  const getDiagnosis = (
    category: SymptomCategory,
    symptom: Symptom
  ): Diagnosis => {
    // Simplified diagnosis database - in production, this would be much more comprehensive
    const diagnoses: Record<string, Diagnosis> = {
      "leaves-yellow":
        locale === "es"
          ? {
              problem: "Clorosis (Amarillamiento de Hojas)",
              description:
                "Las hojas se vuelven amarillas debido a la falta de clorofila, manteniendo las venas verdes.",
              causes: [
                "Deficiencia de hierro o nitrógeno",
                "pH del suelo inadecuado",
                "Riego excesivo o drenaje pobre",
                "Daño a las raíces",
              ],
              treatments: [
                "Probar el pH del suelo (ideal 6.0-7.0)",
                "Aplicar fertilizante con hierro quelado",
                "Mejorar el drenaje del suelo",
                "Reducir la frecuencia de riego",
                "Agregar compost orgánico",
              ],
              whenToCallProfessional:
                "Si el amarillamiento se extiende rápidamente, afecta todo el árbol, o persiste después del tratamiento.",
              severity: "moderate",
            }
          : {
              problem: "Chlorosis (Leaf Yellowing)",
              description:
                "Leaves turn yellow due to lack of chlorophyll, while veins remain green.",
              causes: [
                "Iron or nitrogen deficiency",
                "Improper soil pH",
                "Overwatering or poor drainage",
                "Root damage",
              ],
              treatments: [
                "Test soil pH (ideal 6.0-7.0)",
                "Apply chelated iron fertilizer",
                "Improve soil drainage",
                "Reduce watering frequency",
                "Add organic compost",
              ],
              whenToCallProfessional:
                "If yellowing spreads rapidly, affects entire tree, or persists after treatment.",
              severity: "moderate",
            },
      "leaves-spots":
        locale === "es"
          ? {
              problem: "Enfermedad Fúngica de las Hojas",
              description:
                "Manchas marrones, negras o amarillas causadas por infecciones fúngicas.",
              causes: [
                "Alta humedad",
                "Mala circulación de aire",
                "Follaje mojado",
                "Clima lluvioso prolongado",
              ],
              treatments: [
                "Remover hojas infectadas y desecharlas",
                "Mejorar la circulación de aire mediante poda",
                "Evitar regar el follaje",
                "Aplicar fungicida orgánico si es severo",
                "Mantener el área limpia de hojarasca",
              ],
              whenToCallProfessional:
                "Si la infección es extensa, se propaga rápidamente, o el árbol es valioso.",
              severity: "moderate",
            }
          : {
              problem: "Fungal Leaf Disease",
              description:
                "Brown, black, or yellow spots caused by fungal infections.",
              causes: [
                "High humidity",
                "Poor air circulation",
                "Wet foliage",
                "Prolonged rainy weather",
              ],
              treatments: [
                "Remove infected leaves and dispose",
                "Improve air circulation through pruning",
                "Avoid watering foliage",
                "Apply organic fungicide if severe",
                "Keep area clean of leaf litter",
              ],
              whenToCallProfessional:
                "If infection is extensive, spreading rapidly, or tree is valuable.",
              severity: "moderate",
            },
      "bark-cracks":
        locale === "es"
          ? {
              problem: "Grietas en la Corteza",
              description: "Grietas o hendiduras en la corteza del árbol.",
              causes: [
                "Cambios bruscos de temperatura",
                "Daño por escaldadura solar",
                "Crecimiento rápido",
                "Daño mecánico",
                "Estrés por sequía",
              ],
              treatments: [
                "Normalmente no requiere tratamiento",
                "Proteger del daño adicional",
                "Mantener el riego consistente",
                "Aplicar mantillo alrededor de la base",
                "Monitorear infecciones",
              ],
              whenToCallProfessional:
                "Si las grietas son profundas, supuran savia, o muestran signos de infección o insectos.",
              severity: "low",
            }
          : {
              problem: "Bark Cracking",
              description: "Cracks or splits in tree bark.",
              causes: [
                "Sudden temperature changes",
                "Sunscald damage",
                "Rapid growth",
                "Mechanical damage",
                "Drought stress",
              ],
              treatments: [
                "Usually no treatment needed",
                "Protect from further damage",
                "Maintain consistent watering",
                "Apply mulch around base",
                "Monitor for infection",
              ],
              whenToCallProfessional:
                "If cracks are deep, oozing sap, or showing signs of infection or insects.",
              severity: "low",
            },
      "branches-dead":
        locale === "es"
          ? {
              problem: "Ramas Muertas o Moribundas",
              description: "Ramas que han muerto o están muriendo.",
              causes: [
                "Envejecimiento natural",
                "Enfermedad",
                "Infestación de insectos",
                "Daño por tormenta",
                "Estrés hídrico",
              ],
              treatments: [
                "Podar ramas muertas inmediatamente",
                "Hacer cortes limpios justo fuera del collar de la rama",
                "Desinfectar herramientas de poda entre cortes",
                "Mejorar el cuidado general del árbol",
                "Verificar patrones de riego",
              ],
              whenToCallProfessional:
                "Si las ramas son grandes, están sobre estructuras, o si la muerte de ramas es extensa.",
              severity: "high",
            }
          : {
              problem: "Dead or Dying Branches",
              description: "Branches that have died or are dying.",
              causes: [
                "Natural aging",
                "Disease",
                "Insect infestation",
                "Storm damage",
                "Water stress",
              ],
              treatments: [
                "Prune dead branches immediately",
                "Make clean cuts just outside branch collar",
                "Disinfect pruning tools between cuts",
                "Improve overall tree care",
                "Check watering patterns",
              ],
              whenToCallProfessional:
                "If branches are large, over structures, or if branch death is extensive.",
              severity: "high",
            },
      "roots-exposed":
        locale === "es"
          ? {
              problem: "Raíces Expuestas",
              description: "Raíces visibles sobre la superficie del suelo.",
              causes: [
                "Erosión del suelo",
                "Compactación del suelo",
                "Espacio de raíz limitado",
                "Edad del árbol",
              ],
              treatments: [
                "Agregar 2-3 pulgadas de mantillo orgánico",
                "No agregar más de 3 pulgadas de suelo",
                "Proteger raíces de daño mecánico",
                "Mejorar el drenaje",
                "Evitar compactar el suelo alrededor",
              ],
              whenToCallProfessional:
                "Si las raíces están dañadas, el árbol está inestable, o las raíces están levantando estructuras.",
              severity: "moderate",
            }
          : {
              problem: "Exposed Roots",
              description: "Roots visible above soil surface.",
              causes: [
                "Soil erosion",
                "Soil compaction",
                "Limited root space",
                "Tree age",
              ],
              treatments: [
                "Add 2-3 inches of organic mulch",
                "Do not add more than 3 inches of soil",
                "Protect roots from mechanical damage",
                "Improve drainage",
                "Avoid compacting soil around roots",
              ],
              whenToCallProfessional:
                "If roots are damaged, tree is unstable, or roots are lifting structures.",
              severity: "moderate",
            },
      "whole-stunted":
        locale === "es"
          ? {
              problem: "Crecimiento Lento o Atrofiado",
              description: "El árbol no crece como se espera.",
              causes: [
                "Nutrición del suelo pobre",
                "Compactación del suelo",
                "pH del suelo inadecuado",
                "Riego insuficiente",
                "Competencia de raíces",
              ],
              treatments: [
                "Hacer análisis de suelo",
                "Aplicar fertilizante balanceado",
                "Mejorar la estructura del suelo con compost",
                "Verificar patrones de riego",
                "Aflojar el suelo compactado",
              ],
              whenToCallProfessional:
                "Si el atrofiamiento es severo, o si el árbol es joven y no responde al tratamiento.",
              severity: "moderate",
            }
          : {
              problem: "Slow or Stunted Growth",
              description: "Tree not growing as expected.",
              causes: [
                "Poor soil nutrition",
                "Soil compaction",
                "Improper soil pH",
                "Insufficient watering",
                "Root competition",
              ],
              treatments: [
                "Conduct soil test",
                "Apply balanced fertilizer",
                "Improve soil structure with compost",
                "Check watering patterns",
                "Loosen compacted soil",
              ],
              whenToCallProfessional:
                "If stunting is severe, or if tree is young and not responding to treatment.",
              severity: "moderate",
            },
    };

    // Map symptoms to diagnosis keys
    const symptomKey = `${category}-${symptom.toLowerCase().split(" ")[0]}`;
    const diagnosisKey = Object.keys(diagnoses).find((key) =>
      symptomKey.includes(key.split("-")[1])
    );

    return (
      diagnoses[diagnosisKey || "leaves-yellow"] || diagnoses["leaves-yellow"]
    );
  };

  const handleCategorySelect = (category: SymptomCategory) => {
    setSelectedCategory(category);
    setStep("symptom");
  };

  const handleSymptomSelect = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    if (selectedCategory) {
      const result = getDiagnosis(selectedCategory, symptom);
      setDiagnosis(result);
      setStep("result");
    }
  };

  const handleRestart = () => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedSymptom(null);
    setDiagnosis(null);
  };

  const handleBack = () => {
    if (step === "symptom") {
      setStep("category");
      setSelectedCategory(null);
    } else if (step === "result") {
      setStep("symptom");
      setSelectedSymptom(null);
      setDiagnosis(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300";
      case "moderate":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300";
      case "high":
        return "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Category Selection */}
        {step === "category" && (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-6">
              {t("selectCategory")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCategories().map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleCategorySelect(category.id);
                  }}
                  className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/trees"
                className="text-primary hover:text-primary-dark underline"
              >
                {t("exploretrees")}
              </Link>
            </div>
          </div>
        )}

        {/* Symptom Selection */}
        {step === "symptom" && selectedCategory && (
          <div>
            <button
              onClick={handleBack}
              className="mb-6 text-primary hover:text-primary-dark"
            >
              {t("back")}
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6">
              {t("selectSymptom")}
            </h2>
            <div className="space-y-3">
              {getSymptoms(selectedCategory).map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => {
                    handleSymptomSelect(symptom);
                  }}
                  className="w-full p-4 bg-card rounded-lg border-2 border-border hover:border-primary transition-all text-left"
                >
                  <span className="font-medium">{symptom}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis Result */}
        {step === "result" && diagnosis && (
          <div>
            <button
              onClick={handleBack}
              className="mb-6 text-primary hover:text-primary-dark"
            >
              {t("back")}
            </button>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Severity Badge */}
              <div
                className={`p-4 border-b-2 ${getSeverityColor(diagnosis.severity)}`}
              >
                <div className="font-semibold text-center">
                  {diagnosis.severity === "low" && t("severityLow")}
                  {diagnosis.severity === "moderate" && t("severityModerate")}
                  {diagnosis.severity === "high" && t("severityHigh")}
                </div>
              </div>

              <div className="p-8">
                {/* Problem */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t("problem")}
                  </h3>
                  <p className="text-2xl font-bold">{diagnosis.problem}</p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t("description")}
                  </h3>
                  <p className="text-base">{diagnosis.description}</p>
                </div>

                {/* Causes */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t("causes")}
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosis.causes.map((cause, i) => (
                      <li key={i} className="text-base">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatments */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t("treatments")}
                  </h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {diagnosis.treatments.map((treatment, i) => (
                      <li key={i} className="text-base">
                        {treatment}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* When to call professional */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t("professional")}
                  </h3>
                  <p className="text-base">
                    {diagnosis.whenToCallProfessional}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t("restart")}
                  </button>
                  <Link
                    href="/trees"
                    className="flex-1 px-6 py-3 text-center border-2 border-border rounded-lg hover:border-primary transition-colors"
                  >
                    {t("exploretrees")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ {t("disclaimer")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
